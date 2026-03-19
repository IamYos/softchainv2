"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./SFPostFrame.module.css";
import {
  SFCloseIcon,
  SFLeftParenthesisIcon,
  SFRightParenthesisIcon,
} from "./SFSourceIcons";

export function SFContactForm() {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const canOpen = /\S+@\S+\.\S+/.test(email);

  useEffect(() => {
    if (!isSubmitted) {
      return;
    }

    const interval = window.setInterval(() => {
      setCountdown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    const timeout = window.setTimeout(() => {
      setIsSubmitted(false);
      setCountdown(5);
    }, 5000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [isSubmitted]);

  const openDialog = () => {
    if (!canOpen) {
      return;
    }

    setIsSubmitted(false);
    setIsOpen(true);
  };

  const closeDialog = () => setIsOpen(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsOpen(false);
    setCountdown(5);
    setIsSubmitted(true);
  };

  return (
    <section
      id="closing-cta"
      className={`${styles.sectionRoot} ${styles.contactSection} marketing-anchor`}
    >
      <div className={`${styles.wrapper} ${styles.contactContent}`}>
        <div className={`${styles.contactBackdrop} ${isOpen ? styles.contactBackdropOpen : ""}`} />

        <h2 className={`${styles.contactTitle} ${styles.t4}`}>
          <span>Ready to build software</span>
          <span className={styles.contactTitleSlash}> / </span>
          <span>and systems correctly?</span>
        </h2>

        <div className={styles.emailStage}>
          <div className={styles.emailContent}>
            <SFLeftParenthesisIcon className={styles.parenthesisIcon} />
            <div className={styles.emailFieldWrap}>
              <label htmlFor="contact-email" className={styles.srOnly}>
                Enter your email
              </label>
              <input
                id="contact-email"
                className={styles.emailInput}
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <div className={styles.fieldLine} aria-hidden="true" />
            </div>
            <SFRightParenthesisIcon className={styles.parenthesisIcon} />
          </div>

          <button
            type="button"
            disabled={!canOpen}
            onClick={openDialog}
            className={`${styles.monoPill} ${styles.emailButton} ${styles.p}`}
          >
            Continue
          </button>
        </div>

        <form
          className={`${styles.fieldsDialog} ${isOpen ? styles.fieldsDialogOpen : ""}`}
          onSubmit={handleSubmit}
        >
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close contact form"
            className={`${styles.fieldsClose} ${styles.fieldsCloseMobile}`}
          >
            <SFCloseIcon className={styles.fieldsCloseIcon} />
          </button>

          <h3 className={`${styles.fieldsTitle} ${styles.p2}`}>
            Perfect. Just a few more questions so we can route your project correctly.
          </h3>

          <div className={styles.textField}>
            <label htmlFor="contact-first-name" className={styles.srOnly}>
              First Name
            </label>
            <input
              id="contact-first-name"
              className={styles.fieldInput}
              name="first-name"
              placeholder="First Name"
              required
              type="text"
            />
          </div>

          <div className={styles.textField}>
            <label htmlFor="contact-last-name" className={styles.srOnly}>
              Last Name
            </label>
            <input
              id="contact-last-name"
              className={styles.fieldInput}
              name="last-name"
              placeholder="Last Name"
              required
              type="text"
            />
          </div>

          <div className={styles.textField}>
            <label htmlFor="contact-company-agency" className={styles.srOnly}>
              Company / Agency
            </label>
            <input
              id="contact-company-agency"
              className={styles.fieldInput}
              name="company-agency"
              placeholder="Company / Agency"
              required
              type="text"
            />
          </div>

          <div className={styles.textField}>
            <label htmlFor="contact-job-title" className={styles.srOnly}>
              Job Title
            </label>
            <input
              id="contact-job-title"
              className={styles.fieldInput}
              name="job-title"
              placeholder="Job Title"
              type="text"
            />
          </div>

          <div className={styles.fullField}>
            <label htmlFor="contact-subject" className={styles.srOnly}>
              Subject
            </label>
            <select id="contact-subject" name="subject" className={styles.fieldSelect} defaultValue="">
              <option value="" disabled>
                Subject
              </option>
              <option value="general-inquiries">General Inquiries</option>
              <option value="meeting-request">Meeting Request</option>
              <option value="demo-request">Demo Request</option>
            </select>
          </div>

          <div className={styles.fullField}>
            <label htmlFor="contact-message" className={styles.srOnly}>
              Optional Message
            </label>
            <textarea
              id="contact-message"
              className={styles.fieldTextarea}
              name="message"
              placeholder="Optional Message"
            />
          </div>

          <button type="submit" className={`${styles.monoPillWide} ${styles.fieldSubmit} ${styles.p}`}>
            Submit
          </button>
        </form>

        <button
          type="button"
          onClick={closeDialog}
          aria-label="Close contact form"
          className={`${styles.fieldsClose} ${styles.fieldsCloseDesktop} ${isOpen ? styles.fieldsCloseActive : ""}`}
        >
          <SFCloseIcon className={styles.fieldsCloseIcon} />
        </button>

        <div className={`${styles.formSuccess} ${isSubmitted ? styles.formSuccessVisible : ""}`}>
          <p className={`${styles.successMessage} ${styles.p2}`}>
            Thanks. We&apos;ll be in touch shortly.
          </p>
          <p className={`${styles.successClosing} ${styles.p}`}>
            This box will automatically close in <span>{countdown}</span>...
          </p>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className={`${styles.monoPillWide} ${styles.monoPillOrange} ${styles.p}`}
          >
            Close
          </button>
        </div>

      </div>
    </section>
  );
}
