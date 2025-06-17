import React, {useContext} from 'react'
import noteContext from "../context/notes/noteContext"


const Noteitem = (props) => {
    const context = useContext(noteContext);
    const { deleteNote } = context;
    const { note, updateNote, showAlert } = props; // Destructure showAlert
    return (
        <div className="col-md-3">
            <div className="card my-3">
                <div className="card-body">
                    <h5 className="card-title">{note.title}</h5>
                    <p className="card-text">{note.description}</p>
                    {/* Moved buttons/icons below the description */}
                    <div className="d-flex align-items-center mt-2"> {/* Added mt-2 for a little top margin */}
                        {/* Changed from an icon to a Bootstrap button */}
                        <button className="btn btn-sm btn-danger " onClick={()=>{deleteNote(note._id, showAlert)}}>Delete</button>
                        <i className="far fa-edit mx-2" onClick={()=>{updateNote(note)}}></i>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Noteitem