import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import NotFound from "./components/NotFound";
import Petition from "./components/Petition";
import Petitions from "./components/Petitions";
import User from "./components/User";

function App() {
    return (
        <div className="App">
            <Router>
                <div>
                    <Routes>
                        <Route path="/" element={<Petitions/>}/>
                        <Route path="/:id" element={<Petitions/>}/>
                        <Route path="/petitions/:id" element={<Petition/>}/>
                        <Route path="/user/:id" element={<User/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </div>
            </Router>
        </div>
    );
}
export default App;