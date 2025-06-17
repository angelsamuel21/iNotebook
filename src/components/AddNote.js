import React, { useContext, useState } from "react";
import noteContext from "../context/notes/noteContext";

const AddNote = (props) => {
  // Accept props
  const context = useContext(noteContext);
  const { addNote } = context;

  const [note, setNote] = useState({ title: "", description: "", tag: "" });

  // Fallback showAlert if not provided via props
  const showAlert =
    props.showAlert || ((msg, type) => alert(`${type}: ${msg}`));

  const handleClick = (e) => {
    e.preventDefault();
    // Pass the raw note.tag string.
    // NoteState.js is expected to handle parsing this string (e.g., splitting by comma, trimming, filtering).
    // This change is to resolve the "tagFromComponent.split is not a function" error,
    // which implies NoteState.js receives a non-string (likely the pre-processed array) and tries to split it.
    addNote(note.title, note.description, note.tag, showAlert);
    setNote({ title: "", description: "", tag: "" });
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };
  return (
    <div className="container my-3">
      <h2>Add Note</h2>
      <form className="my-3">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            aria-describedby="emailHelp"
            value={note.title}
            placeholder="Enter note title (min. 5 characters)"
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
            id="description"
            name="description"
            value={note.description}
            placeholder="Enter note description (min. 5 characters)"
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
            id="tag"
            name="tag"
            value={note.tag}
            onChange={onChange}
            placeholder="Enter tags, comma-separated"
          />
          {/* Made tag optional, removed minLength and required */}
        </div>

        <button
          disabled={note.title.length < 5 || note.description.length < 5}
          type="submit"
          className="btn btn-primary"
          onClick={handleClick}
        >
          Add Note
        </button>
      </form>
    </div>
  );
};

export default AddNote;
