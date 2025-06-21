import styles from "@/styles/Navbar.module.css";
import { Text } from "./ui/luxe/text";
import Image from "next/image";

export default function Navbar() {
  return (
    <div className={styles.container}>
        <Image src="/eNAF.png" alt="Logo" width={28} height={28} className={styles.logo}/>
        <Text variant="generate-effect" className={styles.title}>eNAF</Text>
    </div>
  );
}
