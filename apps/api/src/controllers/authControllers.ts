import {Request, Response} from "express"
import { userRegisterValidator, userLoginValidator } from "../middlewares/validators";
import { ValidationError } from "joi";
import prisma  from "../config/db.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register function to create a new user
export const userRegister = async(req: Request, res: Response) => {
  try{
    const body = req.body;
    const payload = await userRegisterValidator.validateAsync(body, {presence: "required"});

    const findUser = await prisma.users.findUnique({
      where:{
        email:payload.email
      }
    })

    if(findUser){
      return res.status(400).send({
        error:{
          email:"Email already exist. Please use another Email."
        }
      })
    }

    payload.password = await bcrypt.hash(payload.password, 10);

    const user = await prisma.users.create({
      data:payload
    })

    return res.status(200).send({
        message:"user created Successfully",
        user
    })

  }catch(error){
    if(error instanceof ValidationError){
        return res.status(400).send({
            message: error.message
        })
    }
    return res.status(500).json({
        message: "Internal Server Error"
    })
  }
}

// Login function to authenticate user
export const userLogin = async(req: Request, res: Response) => {
  try{
    const body = req.body;
    const { email, password } = await userLoginValidator.validateAsync(body, {presence: "required"});

    if (req.cookies.refreshToken) {
      const existingRefreshToken = req.cookies.refreshToken;
      if (!process.env.REFRESH_TOKEN_SECRET) {
        return res.status(500).json({
          message: "REFRESH_TOKEN_SECRET is not configured"
        });
      }
      try {
        const decoded = jwt.verify(existingRefreshToken, process.env.REFRESH_TOKEN_SECRET) as any;
        const existingUser = await prisma.users.findUnique({
          where: { id: decoded.id }
        });
        if (existingUser && existingUser.refreshToken === existingRefreshToken) {
          return res.status(400).json({
            message: "User already logged in"
          });
        }
      } catch (err) {
        // Ignore invalid token, proceed with login
      }
    }
    const user = await prisma.users.findUnique({
      where:{
        email
      }
    })

    if(!user){
      return res.status(400).send({
        error:{
          email:"User not found."
        }
      })
    }

    const isValid = await bcrypt.compare(password, user.password);
    if(!isValid){
      return res.status(400).send({
        error:{
          password:"Invalid Credentials!."
        }
      })
    }
    
    try {
      const accessToken = generateAccessToken(user.id,user.name, user.email);
      const refreshToken = generateRefreshToken(user.id);

      await prisma.users.update({
        where: { id: user.id },
        data: { refreshToken }
      });
      // Set cookies using utility function
      res.cookie('accessToken', accessToken, getCookieOptions(1)); // 1 day
      res.cookie('refreshToken', refreshToken, getCookieOptions(7)); // 7 days
      
      return res.status(200).send({
        message:"Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile
        },
        accessToken, // Also send in response body for client-side usage if needed
        refreshToken
      });
    } catch (tokenError) {
      return res.status(500).json({
        message: "Failed to generate token"
      });
    }

  }catch(error){
    if(error instanceof ValidationError){
        return res.status(400).send({
            message: error.message
        })
    }
    return res.status(500).json({
        message: "Internal Server Error"
    })
  }
}

// Logout function to clear cookies
export const userLogout = async (req: Request, res: Response) => {
  try {
    
    if (req.cookies.refreshToken) {
      const decoded = jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET!) as any;
      await prisma.users.update({
        where: { id: decoded.id },
        data: { refreshToken: null }
      });
    }

    // Clear cookies by setting them with past expiration
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({
      message: "Logged out successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// Function to refresh access token using refresh token
export const refreshAccessToken = async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        return res.status(401).json({
        message: "Unauthorized request"
      });
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
      return res.status(500).json({
        message: "REFRESH_TOKEN_SECRET is not configured"
      });
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        ) as any
    
       // Get user from database
        const user = await prisma.users.findUnique({
          where: { id: decodedToken.id }
        });
        
        if (!user) {
          return res.status(401).json({
            message: "Invalid refresh token"
          });
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({
                message: "Refresh token is expired or used"
            });
        }

        const newAccessToken = generateAccessToken(user.id, user.name, user.email);
        const newRefreshToken = generateRefreshToken(user.id);
    
        await prisma.users.update({
          where: { id: user.id },
          data: { refreshToken: newRefreshToken }
        });
         // Set new access token in cookie
        res.cookie('accessToken', newAccessToken, getCookieOptions(1));
        res.cookie('refreshToken', newRefreshToken, getCookieOptions(7));

    return res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
    } catch (error) {
        return res.status(401).json({
      message: "Invalid refresh token"
    });
    }

}

// Utility function to generate access token
const generateAccessToken = (userId: number, userName: string, email: string): string => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not configured");
  }
  
  return jwt.sign(
    {
      id: userId,
      email: email
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

// Utility function to generate refresh token
const generateRefreshToken = (userId: number): string => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not configured");
  }
  
  return jwt.sign(
    {
      id: userId
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

// Cookie configuration utility
const getCookieOptions = (maxAgeInDays: number = 1) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: maxAgeInDays * 24 * 60 * 60 * 1000
});


