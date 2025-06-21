import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import noteContext from "../context/notes/noteContext";
import Noteitem from "./Noteitem";
import AddNote from "./AddNote";

const Notes = (props) => {
  // Accept props
  const context = useContext(noteContext);
  const navigate = useNavigate();
  const { notes, getNotes, editNote } = context;
  useEffect(() => {
    // Since this component is now protected by a route,
    // we can assume a token exists and just fetch the notes.
    getNotes();
  }, [getNotes]); // Dependency array ensures this runs when getNotes is available/stable.
  const ref = useRef(null);
  const refClose = useRef(null);
  const [note, setNote] = useState({
    id: "",
    etitle: "",
    edescription: "",
    etag: "",
  });

  const updateNote = (currentNote) => {
    ref.current.click();
    setNote({
      id: currentNote._id,
      etitle: currentNote.title || "",
      edescription: currentNote.description || "", // Corrected: should be currentNote.description
      // Convert tags array to a comma-separated string for the input field
      etag: Array.isArray(currentNote.tags) ? currentNote.tags.join(", ") : (currentNote.tags || ""),
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    if (!(note.etitle.length < 5 || note.edescription.length < 5)) {
      // Check if button would be enabled

      // Convert the etag string back to an array of strings
      // This splits by comma, trims whitespace from each tag, and filters out any empty tags
      const tagsArray = note.etag.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== "");

      editNote(
        note.id,
        note.etitle,
        note.edescription,
        tagsArray, // Pass the processed array of tags
        props.showAlert
      );
      refClose.current.click();
    }
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  return (
    <>
      <AddNote showAlert={props.showAlert} /> {/* Pass showAlert to AddNote */}
      <button
        ref={ref}
        type="button"
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Launch demo modal
      </button>
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Edit Note
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form
                className="my-3"
                id="editNoteForm"
                onSubmit={handleFormSubmit}
              >
                {" "}
                {/* Add id and onSubmit handler */}
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="etitle"
                    name="etitle"
                    value={note.etitle}
                    aria-describedby="emailHelp"
                    onChange={onChange}
                    minLength={5}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="edescription"
                    name="edescription"
                    value={note.edescription}
                    onChange={onChange}
                    minLength={5}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="tag" className="form-label">
                    Tag
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="etag"
                    name="etag"
                    value={note.etag}
                    onChange={onChange}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                ref={refClose}
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                disabled={
                  note.etitle.length < 5 || note.edescription.length < 5
                }
                type="submit"
                form="editNoteForm"
                className="btn btn-primary"
              >
                Update Note
              </button>{" "}
              {/* Button is type="submit" and linked to the form */}
            </div>
          </div>
        </div>
      </div>
      <div className="row my-3">
        <h2>Your Notes</h2>
        <div className="container mx-2">
          {/* Check if notes is an array and empty before displaying "No notes" */}
          {Array.isArray(notes) && notes.length === 0 && "No notes to display"}
        </div>
        {/* Check if notes is an array before mapping */}
        {Array.isArray(notes) &&
          notes.map((note) => {
            return (
              <Noteitem
                key={note._id}
                updateNote={updateNote}
                showAlert={props.showAlert}
                note={note}
              />
            );
          })}
      </div>
    </>
  );
};

export default Notes;
