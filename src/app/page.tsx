import styles from "@/styles/page.module.css";
import Navbar from "@/components/Navbar";
import Main from "@/components/Main";

export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />
      <Main />
    </div>
  );
}
