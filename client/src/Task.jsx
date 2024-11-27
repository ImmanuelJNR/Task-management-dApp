import { FaTrash } from "react-icons/fa";
import "./Task.css";

const Task = ({ taskText, onClick }) => {
  return (
    <div className="todo">
      <div className="divStyles">
        <input type="checkbox" />
        <p className="todoText">{taskText}</p>
      </div>

      <FaTrash className="delete" onClick={onClick} />
    </div>
  );
};

export default Task;
