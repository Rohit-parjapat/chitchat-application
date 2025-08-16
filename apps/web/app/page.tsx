import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
      Hi this body
      </main>
      <footer className={styles.footer}>
       <p>Footer content goes here</p>
      </footer>
    </div>
  );
}
