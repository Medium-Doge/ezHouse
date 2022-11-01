import { useRef, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import logincss from './authorisation.css';

const LOGIN_URL = '/auth';

const Login = () => {
    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const {state} = useLocation();
    const from = "/";
    //const from = "/predictPrice";

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        if (state != null) { // some browser got weird issue
            if (state.alert != null) {
                alert(state.alert)  
                state.alert = null 
            }
        }
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ user, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log(JSON.stringify(response?.data));
            //console.log(JSON.stringify(response));
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({ user, pwd, roles, accessToken });
            //setUser('');
            //setPwd('');
            navigate(from, { replace: true });
            //navigate("/predictPrice");

            //console.log("test");
        } catch (err) {
            if (!err?.response) {
                console.log(err?.response);
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.response?.status === 401) {
                setErrMsg('Wrong Username or Password');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    }

    return (
        <>
                <div class="login_wrapper">
            <div class="signin_wrapper">
                <div>

                
                <div class="signin_text">SIGN IN</div>
                <form onSubmit={handleSubmit}>
                    <div class="input-group-wrap">
                        
                    <div ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</div>
                        <div class="omrs-input-group">
                            <label class="omrs-input-underlined">
                                <input
                                    type="text"
                                    id="username"
                                    ref={userRef}
                                    autoComplete="off"
                                    onChange={(e) => setUser(e.target.value)}
                                    value={user}
                                    required
                                />
                                <span class="omrs-input-label">Username</span>
                            </label>
                        </div>
                    </div>
                    <div class="input-group-wrap">
                        <div class="omrs-input-group">
                            <label class="omrs-input-underlined">
                                <input
                                    type="password"
                                    id="password"
                                    onChange={(e) => setPwd(e.target.value)}
                                    value={pwd}
                                    required
                                />
                                <span class="omrs-input-label">Password</span>
                            </label>
                        </div>
                    </div>
                    <button class="signin_button">SIGN IN</button>
                </form>
                <p>
                    Don't have an account? Sign Up&nbsp;<span className="line">
                        <Link to="/register">here</Link>
                    </span>
                </p>
            </div>
            </div>
        </div>
        </>
    )
}

export default Login
