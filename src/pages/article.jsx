import { useEffect, useState } from 'react'
// firebase
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, provider } from "../firebase/config";
import { 
    addDoc,
    collection, 
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore'
// Assets
import { AiOutlineStar, AiFillStar } from 'react-icons/ai'
// Styles
import styles from '../styles/pages/article.module.css'
import { useParams } from 'react-router-dom'
// Utils
import { GPTClient } from '../utils/gptclient.util'
import { translateWord } from '../utils/translateWord.util';
// Components
import QuestionForm from '../components/article/QuestionForm'
// Configs
import { API_KEY_OPENAI, NEWS_DATA_API_KEY } from '../configs/apikeys.config'
import { CHATGPT_API_URL, NEWS_API_URL } from '../configs/url.config'


/**
 * Component renders the article page.
 */
function Article() {
    
    // States
    const { title } = useParams()
    const [user, loading, error] = useAuthState(auth)
    const [articleData, setArticleData] = useState(null)
    const [questions, setQuestions] = useState([])
    const [isFavorite, setIsFavorite] = useState(false)
    const [favoriteArticles, setFavoriteArticles] = useState([])

    // Handlers
    const loadArticle = async () => {
        // Load article data
        const res = await fetch(NEWS_API_URL.by_title(title))
        const data = await res.json()
        const article = data.results?.[0]
        setArticleData(article)

        // Determine if article is in favorite list
        await getFavoriteArticles()
    }
    const getFavoriteArticles = async () => {
        // Determine if article is in favorite list
        const userRef = doc(db, 'users', user?.uid)
        const userDoc = await getDoc(userRef)
        const userData = userDoc.data()
        const _favoriteArticles = userData.favoriteArticles ?? []
        setIsFavorite(_favoriteArticles.includes(articleData?.title))
        setFavoriteArticles(_favoriteArticles)
    }
    const loadQuestions = async () => {
        // Get questions
        const data = await GPTClient.getQuestions(articleData.title, articleData.content)
        setQuestions(data)
    }
    const toggleFavorite = async () => {
        // function toggles the article in the favorite list.
        
        if (!articleData) {
            alert('Article is not loaded yet or does not exist.')
            return
        }
        try {
            // Toggle article title in favorite articles array
            const userRef = doc(db, 'users', user?.uid)
            console.log('favorite not loaded')
            if (!favoriteArticles) {
                // Get favorite articles before proceeding
                await getFavoriteArticles()
            }
            const isFavorite = favoriteArticles.includes(articleData.title)
            if (isFavorite) {
                // Remove article from favorite list
                const updatedFavoriteArticles = favoriteArticles.filter(a => a !== articleData.title)
                setFavoriteArticles(updatedFavoriteArticles)
                await setDoc(userRef, { favoriteArticles: updatedFavoriteArticles }, { merge: true })
            }
            else {
                // Add article to favorite list
                const updatedFavoriteArticles = [...favoriteArticles, articleData.title]
                setFavoriteArticles(updatedFavoriteArticles)
                await setDoc(userRef, { favoriteArticles: updatedFavoriteArticles }, { merge: true })
            }
        }
        catch (err) {
            alert(err.message ?? err.data ?? 'Something went wrong.')
        }
    }

    // Effects
    useEffect(() => {
        // On user load
        console.log(user)
        if (user) {
            // Load data on initial page load.
            loadArticle()
        }
    }, [user])
    useEffect(() => {
        // Load questions when data is loaded.
        if (articleData) {
            loadQuestions()
        }
    }, [articleData])
    useEffect(() => {
        // Determine if article is in favorite list
        setIsFavorite(favoriteArticles.includes(articleData?.title))
    }, [favoriteArticles])

    return (
        <div className={styles["Article"]}>
            <section className={styles["text"]}>
                <div className={styles["heading"]}>
                    <h2>{articleData?.title}</h2>
                    <span>
                        {
                            isFavorite
                                ? <AiFillStar size={26} onClick={toggleFavorite} />
                                : <AiOutlineStar size={26} onClick={toggleFavorite} />
                        }
                    </span>
                </div>
                <span className={styles['introduction']}><b></b>&nbsp;{articleData?.content
                    .split(' ')
                    .map((w,i) => <><HighlightWords 
                        key={i} 
                        w={w}
                        meaning={translateWord(w)} />&nbsp;
                    </>)
                }</span>
            </section>
            <section className={styles["forms"]}>
                {questions?.map((q,i) => <QuestionForm key={i} {...q} />)}
            </section>
        </div>
    )
}

export default Article


// Helper components

/**
 * Component gets a word and returns a highlighted word with explanation.
 * The component currently determines the highlighted word via a 10% probability function, but a defined function can be implemented later.
 */
function HighlightWords({ w, meaning }) {
    // States
    const [show, setShow] = useState(false)
    // Handlers
    const showHandler = () => {
        if (meaning)
            setShow(!show)
    }
    return (
        <span className={meaning ? styles['marked'] : ''} onClick={showHandler}>
            {show ? <>&nbsp;&nbsp;{meaning}&nbsp;&nbsp;</> : w}
        </span>
    )
}