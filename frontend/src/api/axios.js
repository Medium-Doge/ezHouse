import axios from 'axios';

export default axios.create({
    baseURL: 'https://registerloginserver.herokuapp.com/'
});

