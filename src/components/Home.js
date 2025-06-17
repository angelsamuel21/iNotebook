import Notes from './Notes';

export const Home = (props) => { // Accept props

    return (
        <div>
            <Notes showAlert={props.showAlert}/> {/* Pass showAlert to Notes */}
        </div>
    )
}