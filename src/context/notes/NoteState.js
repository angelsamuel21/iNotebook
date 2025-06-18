import NoteContext from "./noteContext";
import { useState, useCallback } from "react"; // Import useCallback

const NoteState = (props) => {
  const host = process.env.REACT_APP_API_BASE_URL; // Ensure this is set in your .env file
  const notesInitial = []
  const [notes, setNotes] = useState(notesInitial)

  // Get all Notes
  const getNotes = useCallback(async () => {
    try {
      const response = await fetch(`${host}/api/notes`, { // Corrected endpoint to GET /api/notes
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "auth-token": localStorage.getItem('token')
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (json.data && Array.isArray(json.data)) {
        setNotes(json.data);
      } else {
        console.error("Fetched notes data is not in the expected format:", json);
        setNotes([]); // Fallback to an empty array if data is not as expected
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setNotes([]); // Ensure notes is an array even on error
      // Optionally, use showAlert if passed or available globally in context
    }
  }, [host]); // Add host as a dependency, setNotes is stable

  // Add a Note
  // Updated to accept showAlertCallback and handle 'tags' mapping
  const addNote = useCallback(async (title, description, tagFromComponent, showAlertCallback) => {
    try {
      // Process the tag string into an array of strings
      // This handles comma-separated tags and ensures an array is sent
      const tagsToSend = tagFromComponent
        ? tagFromComponent.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== "") // Filter out empty strings after trimming
        : []; // If tagFromComponent is falsy (empty string, null, undefined), send an empty array
      const response = await fetch(`${host}/api/notes`, { // Corrected endpoint to POST /api/notes
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "auth-token": localStorage.getItem('token')
        },
        body: JSON.stringify({ title, description, tags: tagsToSend })
      });
      
      const jsonResponse = await response.json(); // Always try to parse JSON

      if (!response.ok) {
        if (showAlertCallback) showAlertCallback(jsonResponse.message || jsonResponse.error || `Error: ${response.status}`, "danger");
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }

      if (jsonResponse.data) {
        setNotes(prevNotes => {
          // Defensive check: Ensure prevNotes is an array.
          if (!Array.isArray(prevNotes)) {
            console.error("CRITICAL: prevNotes in addNote is not an array. State was:", prevNotes, "Creating new array with current note.");
            // If prevNotes is corrupted, start a new array with the current new note.
            return [jsonResponse.data];
          }
          return prevNotes.concat(jsonResponse.data);
        });
        if (showAlertCallback) showAlertCallback("Note added successfully!", "success");
      } else {
        // This case might indicate a backend issue if status is OK but no data
        console.error("Note added, but no data returned in response:", jsonResponse);
        if (showAlertCallback) showAlertCallback(jsonResponse.message || "Note added, but server response was incomplete.", "warning");
      }
    } catch (error) {
      console.error("Failed to add note:", error);
      // Avoid calling showAlertCallback if it was already called for an HTTP error
      if (error.message && !error.message.startsWith("HTTP error!") && showAlertCallback) {
        showAlertCallback("Could not add note. Please try again.", "danger");
      }
    }
  }, [host, notes]); // notes is a dependency because of notes.concat

  // Delete a Note
  const deleteNote = useCallback(async (id, showAlertCallback) => {
    try {
      const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "auth-token": localStorage.getItem('token')
        }
      });
      const jsonResponse = await response.json(); // Attempt to parse JSON for messages

      if (!response.ok) {
        if (showAlertCallback) showAlertCallback(jsonResponse.message || `Error: ${response.status}`, "danger");
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }
      
      const newNotes = notes.filter((note) => { return note._id !== id });
      setNotes(newNotes);
      if (showAlertCallback) showAlertCallback("Note deleted successfully!", "success");

    } catch (error) {
      console.error("Failed to delete note:", error);
      if (error.message && !error.message.startsWith("HTTP error!") && showAlertCallback) {
         showAlertCallback("Could not delete note. Please try again.", "danger");
      }
    }
  }, [host, notes]); // notes is a dependency because it's used in filter

  // Edit a Note
  const editNote = useCallback(async (id, title, description, tagFromComponent, showAlertCallback) => {
    try {
      const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "auth-token": localStorage.getItem('token')
        },
        // Ensure tagFromComponent (which should be an array from Notes.js) is passed
        // If tagFromComponent could be undefined or not an array, add defensive check:
        // const tagsToSend = Array.isArray(tagFromComponent) ? tagFromComponent : [];
        body: JSON.stringify({ title, description, tags: Array.isArray(tagFromComponent) ? tagFromComponent : [] })
      });
      const jsonResponse = await response.json(); // Attempt to parse JSON

      if (!response.ok) {
        if (showAlertCallback) showAlertCallback(jsonResponse.message || `Error: ${response.status}`, "danger");
        throw new Error(jsonResponse.message || `HTTP error! status: ${response.status}`);
      }

      // Defensive check for 'notes' state before stringifying and processing
      if (!Array.isArray(notes)) {
          console.error("CRITICAL: 'notes' state read in editNote is not an array. State was:", notes);
          if (showAlertCallback) showAlertCallback("Cannot update note due to inconsistent application state.", "danger");
          return; // Abort if notes state is corrupted
      }

      // Use .map for a more functional approach to update the notes array immutably
      const newNotes = notes.map((note) => {
        if (note._id === id) {
          return {
            ...note, // Keep other properties of the note
            title,
            description,
            // Assuming the backend 'tags' field is what we want to update.
            // If your client-side note object uses 'tag' consistently, use 'tag: tagFromComponent'
            tags: Array.isArray(tagFromComponent) ? tagFromComponent : [] // Ensure it's an array for local state update
          }
        }
        return note; // Return other notes unchanged
      });
      setNotes(newNotes);
      if (showAlertCallback) showAlertCallback("Note updated successfully!", "success");

    } catch (error) {
      console.error("Failed to edit note:", error);
      if (error.message && !error.message.startsWith("HTTP error!") && showAlertCallback) {
        showAlertCallback("Could not update note. Please try again.", "danger");
      }
    }
  }, [host, notes]); // notes is a dependency because it's used in map

  return (
    <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNotes }}>
      {props.children}
    </NoteContext.Provider>
  )

}
export default NoteState;