import { useNavigate } from "react-router-dom"

const REGISTER_URL = '/unauthorized';

const Unauthorized = () => {
    const navigate = useNavigate();

    const goBack = () => navigate(-1);

    const navigateLogin = () => {
        // 👇️ navigate to /
        navigate('/login');
    };

    return (
        <section>
            <h1>Unauthorized</h1>
            <br />
            <p>You do not have access to the requested page. Pleasse login to continue.</p>
            <div className="flexGrow">
                <button onClick={navigateLogin}>Login</button>
            </div>
        </section>
    )
}

export default Unauthorized
