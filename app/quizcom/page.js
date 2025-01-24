import Link from "next/link"
export default function Quiz (){
    return(
        <div className="main">
            <h1 className="welcom">Welcome To Quiz Game</h1>
            <Link href="/quizgame">
            <button className="star">Get Started</button>
            </Link>
        </div>
    )
}