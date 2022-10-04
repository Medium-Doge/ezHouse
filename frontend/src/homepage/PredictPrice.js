import { Link } from "react-router-dom"

const Admin = () => {
    return (
        <section>
            <h1>Predict Price Page</h1>
            <br />
            <p>Add stuff to predict price</p>
            <div className="flexGrow">
                <Link to="/">Home</Link>
            </div>
        </section>
    )
}

export default Admin
