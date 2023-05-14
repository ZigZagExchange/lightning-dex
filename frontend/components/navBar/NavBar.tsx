import Link from "next/link"
import { useState } from "react"
import styles from "./NavBar.module.css"

function NavBar() {
  const [tab, setTab] = useState(2)
  return (
    <nav className={`${styles.container} lg:flex hidden`}>
      <Link href="/about" className={`${styles.tab_container} ${tab === 1 ? styles.tab_active : ''}`} onClick={() => setTab(1)}>About</Link>
      <Link href="/" className={`${styles.tab_container} ${tab === 2 ? styles.tab_active : ''}`} onClick={() => setTab(2)}>Bridge</Link>
      {/* <Link href="/" className={`${styles.tab_container} ${tab === 3 ? styles.tab_active : ''}`} onClick={() => setTab(3)}>Swap</Link> */}
      <Link href="/pool" className={`${styles.tab_container} ${tab === 4 ? styles.tab_active : ''}`} onClick={() => setTab(3)}>Pools</Link>
      {/* <Link href="/stake" className={`${styles.tab_container} ${tab === 5 ? styles.tab_active : ''}`} onClick={() => setTab(5)}>Stake</Link> */}
      <Link href="/explorer" className={`${styles.tab_container} ${tab === 6 ? styles.tab_active : ''}`} onClick={() => setTab(4)}>Explorer</Link>
    </nav>
  )
}

export default NavBar