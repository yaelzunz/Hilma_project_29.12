import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
// Assets
import Interests from '@/../../public/data/interests.json'
import { BiHide, BiShow } from 'react-icons/bi'
import { FcGoogle } from 'react-icons/fc'
// Components
import InterestsModal from '../components/interests-modal'
// Styles
import styles from '../styles/pages/signup.module.css'
// firebase
import { createUserWithEmailAndPassword, sendSignInLinkToEmail, updateProfile, signInWithPopup, deleteUser } from "firebase/auth";
import { auth, db, provider } from "../firebase/config";
import { 
    addDoc,
    collection, 
    doc,
    setDoc
} from 'firebase/firestore'



export default function Signup() {

    // Firebase
    const usersRef = collection(db, 'users')
    
    // States
    const navigate = useNavigate()
    const [hasAuthenticatedWithGoogle, setHasAuthenticatedWithGoogle] = useState(false)
    const [isShowingPassword, setIsShowingPassword] = useState(false)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    console.log(selectedInterests, selectedDifficulty)
    
    /**
     * Function handles signup.
     * @param data the data to signup with (exists when signing up via google, otherwise use states).
     */
    const handleSignup = async data => {

        if (hasAuthenticatedWithGoogle && data) {
            // User has authenticated with google, signup with remaining data
            // Create new user entry in users document
            const res = await setDoc(doc(db, "users", auth.currentUser.uid), {
                name: name,
                email: email,
                difficulty: data.difficulty,
                interests: data.interests,
                uid: auth.currentUser.uid,
            })
            // Navigate to login page
            // navigate(`/login?success_register_name=${name}`)
        }
        else if (email === "" || password === "" || name === "" || selectedDifficulty === null || !selectedInterests.length) {
            alert("אחד מהשדות ריק")
        }
        else if (!isStrongPassword(password)) {
            alert("הסיסמא חייבת להיות בעלת 8 תווים לפחות, ולהכיל אותיות גדולות וקטנות, מספרים ותווים מיוחדים")
        }

        else {
            // Create user in firebase auth
            try {
                // Create new user in firebase Auth 
                const cred = await createUserWithEmailAndPassword(auth, email, password)
                // Update auth profile
                await updateProfile(cred.user, {
                    displayName: `${name}`,
                    photoURL: null,
                })
                // Create new user entry in users document
                const res = await setDoc(doc(db, "users", cred.user.uid), {
                    name: name,
                    email: email,
                    difficulty: selectedDifficulty,
                    interests: selectedInterests,
                    uid: cred.user.uid,
                })
                console.log({res})
                // Navigate to login page
                // navigate(`/login?success_register_name=${name}`)
            }
            catch (err) {
                // Error in signup
                alert("Error in Signup" + err.message)
            }
        }
    };




    // Event handler to update the selected difficulty when a radio button is clicked
    const handleDifficultyChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedDifficulty(selectedValue);
    }


    // Event handler to update the selected interests array when checkboxes are checked or unchecked
    const handleInterestChange = (event) => {

        const interest = event.target.value;
        const isChecked = event.target.checked;

        if (isChecked) {
            setSelectedInterests((prevSelectedInterests) => [
                ...prevSelectedInterests,
                interest,
        ]);
        } else {
            setSelectedInterests((prevSelectedInterests) =>
                prevSelectedInterests.filter((item) => item !== interest)
            );
        }
    }

    // Signup with Google
    const handleLoginWithGoogle = async e => {
        e.preventDefault();
        try {
            const data = await signInWithPopup(auth,provider)
            setHasAuthenticatedWithGoogle(true)
            // Save OAuth data
            setEmail(data.user.email)
            setName(data.user.displayName)

        }
        catch (err) {
            console.log(err)
        }
    }        
      
    // password check
    const isStrongPassword = text => {
        // בדיקת אורך מינימלי: 8 תווים
        if (text.length < 8) {
            return false;
        }
        // בדיקת שימוש באותיות גדולות וקטנות
        const hasUpperCase = /[A-Z]/.test(text);
        const hasLowerCase = /[a-z]/.test(text);
        if (!hasUpperCase || !hasLowerCase) {
            return false;
        }
        // בדיקת שימוש במספרים
        const hasNumbers = /\d/.test(text);
        if (!hasNumbers) {
            return false;
        }
        // בדיקת שימוש בתווים מיוחדים
        const hasSpecialChars = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/.test(text);
        if (!hasSpecialChars) {
            return false;
        }

        // אם הסיסמא עברה את כל הבדיקות, היא חזקה
          return true;
    }

      
    return (
        <div className={styles["Signup"]}>
            <div className={styles["modal"]}>
                <div className={styles["title"]}>
                    <h1>הרשמה</h1>
                    <h3>בואו לגלות את קאפיש</h3>
                </div>

                <form>
                    <section className={styles["inputs-l"]}>
                        <div className={styles["input-radio"]}>
                            <span>רמת קושי</span>
                            <div className={styles["radio-list"]}>
                                <label htmlFor="hard">Hard</label>
                                <input type="radio" name='difficulty' id='hard' value='hard' onChange={handleDifficultyChange}/>
                                <label htmlFor="easy">Easy</label>
                                <input type="radio" name='difficulty' id='easy' value='easy' onChange={handleDifficultyChange}/>
                            </div>
                        </div>

                        <button className={styles["Signupopt-google"]}onClick={handleLoginWithGoogle}>
                            <span>התחברות באמצעות גוגל</span>
                            <FcGoogle size={30} />
                        </button>
                    </section>

                    <section className={styles["inputs-r"]}>
                        <div className={styles["input-text"]}>
                            <input type="text" placeholder="שם מלא" value={name} onChange={(e)=>setName(e.target.value)}/>
                        </div>

                        <div className={styles["input-select"]}>
                            <div className={styles["input-text"]} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <input type="text" placeholder="תחומי עיניין" value={selectedInterests.join(', ')} readOnly={true} />
                            </div>
                            {isDropdownOpen && (
                                <div className={styles["checkbox-list"]}>
                                    {Interests.map((interest) => (
                                        <label key={interest} className={styles["checkbox-label"]}>
                                            <input
                                                type="checkbox"
                                                value={interest}
                                                checked={selectedInterests.includes(interest)}
                                                onChange={handleInterestChange}
                                                className={styles["checkbox-input"]} />
                                            <span className={styles["custom-checkbox"]} />
                                            {interest}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles["input-text"]}>
                            <input type="text" placeholder="אימייל" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                        </div>

                        <div className={styles["input-text"]}>
                            <input type={isShowingPassword ? "text" : 'password'} placeholder="צור סיסמא" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                            <div className={styles["show-input"]} 
                                title={`${isShowingPassword ? 'Hide' : 'Show'} password`}
                                onClick={() => setIsShowingPassword(s => !s)}>
                                { isShowingPassword 
                                    ? <BiShow size={18} />
                                    : <BiHide size={18} />
                                }
                            </div>
                        </div>

                        <section className={styles["links"]}>
                            <NavLink to='/login' className={styles['login']}>
                                <span>יש לך כבר חשבון? התחבר</span>
                            </NavLink>
                        </section>

                        <input type='submit' value="הירשם" onClick={handleSignup}/>
                        
                    </section>

                </form>
            </div>
            {/* interests modal - when signing up with google */}
            { hasAuthenticatedWithGoogle && <InterestsModal onSubmit={handleSignup} /> }
        </div>
    )
}
