"use client";

import styles from "./SFPostFrame.module.css";
import { BookingFlow } from "@/components/booking/BookingFlow";

export function SFContactForm() {
  return (
    <section
      id="closing-cta"
      className={`${styles.sectionRoot} ${styles.contactSection} marketing-anchor`}
    >
      <div className={`${styles.wrapper} ${styles.contactContent}`}>
        <BookingFlow />
      </div>
    </section>
  );
}
