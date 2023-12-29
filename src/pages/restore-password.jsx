import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
// Assets
import { BiHide, BiShow } from 'react-icons/bi'
import { FcGoogle } from 'react-icons/fc'
import { AiOutlineLock } from 'react-icons/ai'
// Styles
import styles from '../styles/pages/restore-password.module.css'
// firebase
import {sendPasswordResetEmail} from 'firebase/auth'
import { auth } from "../firebase/config";
import firebase from 'firebase/app';
import 'firebase/auth';



/**
 * Component renders the restore-password page.
 */
function RestorePassword() {
    // States
    const [isShowingPassword, setIsShowingPassword] = useState(false)
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        console.log('hjhklm')
        try {
          await auth.sendPasswordResetEmail(email);
          setMessage('Password reset email sent! Please check your email.');
          setEmail('');
        } catch (error) {
          setMessage(error.message);
        }
      };


    return (
        <div className={styles["Login"]}>
            <img src="imgs/bulb-books.png" alt="bulb-books" />
            <div className={styles["modal"]}>
                <div className={styles["title"]}>
                    <AiOutlineLock size={24} />
                    <h1>שחזור סיסמא</h1>
                </div>
                <form className={styles["email-verification"]}>
                    <div className={styles["input-text"]}>
                        <label htmlFor="email">רשום את חשבון האימייל שלך</label>
                        <input type="email" id='email' />
                    </div>
                    <div className={styles["input-submit"]}>
                        <input type="submit" value="שלח" onClick={handleResetPassword}/>
                    </div>
                </form>
                <span className={styles['form-seperator']}>&nbsp;</span>
                <form className={styles['email-code']}>
                    <div className={styles["input-text"]}>
                        <label htmlFor="code">רשום את הקוד שנשלח אליך</label>
                        <input type="text" id='code' />
                    </div>
                    <div className={styles["input-submit"]}>
                        <input type="submit" value="בדיקה" />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RestorePassword