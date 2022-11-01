import { Link } from "react-router-dom"
import missingcss from "./missing.css"
const Missing = () => {
    return (
        <div class="missing_wrapper2">
            <div class="noise"></div>
            <div class="overlay"></div>
            <div class="terminal">
                <h1>Error <span class="errorcode">404</span></h1>
                <p class="output">Your API call was invalid.</p>
                <p class="output"><Link class="missing_link" to="/">Return to the homepage</Link></p>
                <p class="output">Good luck.</p>
            </div>
        </div>
    )
}

export default Missing
