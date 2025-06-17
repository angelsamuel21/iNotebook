import React from 'react'

// This component expects a prop, e.g., `alertDetails`,
// which is an object like { message: 'Your message', type: 'success' }
// or null/undefined if no alert is to be shown.
export const Alert = (props) => {
    // If no alert data is provided, or if the message is empty, render nothing.
    if (!props.alertDetails || !props.alertDetails.message) {
        return <div style={{ minHeight: '50px' }}></div>; // Reserve space to prevent layout shift
    }

    const { message, type } = props.alertDetails;

    // Optional: Capitalize the type for display, e.g., "Success", "Danger"
    const capitalize = (str) => {
        if (!str) return '';
        if (str === "danger") return "Error"; // Common to display "Error" for "danger" type
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        // Using a div with a min-height can prevent layout shifts when the alert appears/disappears.
        <div style={{ minHeight: '50px' }}>
            <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
                <strong>{capitalize(type)}:</strong> {message}
                {/* Optional: Add a close button if you want users to dismiss alerts manually */}
                {/* <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> */}
            </div>
        </div>
    )
}