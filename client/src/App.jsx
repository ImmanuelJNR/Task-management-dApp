import { useState, useEffect } from "react";

import { TaskContractAddress } from "../config.js";
import { ethers } from "ethers";
import TaskAbi from "/utils/TaskContract.json";

import "./App.css";
import Task from "./Task.jsx";

const App = () => {
  const [tasks, setTask] = useState([]);
  const [input, setInput] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [correctNetwork, setCorrectNetwork] = useState(false);

  const getAllTasks = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Ethereum object doesn't exist");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const TaskContract = new ethers.Contract(
        TaskContractAddress,
        TaskAbi.abi,
        signer
      );

      console.log("Fetching tasks...");
      const allTasks = await TaskContract.getMyTasks();

      console.log("Fetched tasks:", allTasks); // Log the fetched tasks

      // Ensure allTasks is an array
      if (Array.isArray(allTasks)) {
        const tasksFormatted = allTasks.map((task) => ({
          id: task.id.toString(), // Ensure id is converted to string for React key
          taskText: task.taskText,
          isDeleted: task.isDeleted,
        }));
        setTask(tasksFormatted);
      } else {
        console.log("Unexpected data format:", allTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    getAllTasks();
  }, []);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Metamask not detected");
        return;
      }

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain:" + chainId);
      const sepoliaChainId = "0xaa36a7";

      if (chainId !== sepoliaChainId) {
        console.log("Please connect to Sepolia network.");
        return;
      } else {
        setCorrectNetwork(true);
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Found account", accounts[0]);
      setCurrentAccount(accounts[0]);
      return accounts[0]; // Return the connected account
    } catch (error) {
      console.log("Error connecting to metamask", error);
      return;
    }
  };

  const AddTask = async (e) => {
    e.preventDefault();

    let account = currentAccount;

    if (!account) {
      // If wallet is not connected, trigger MetaMask to connect the account
      account = await connectWallet();
      if (!account) {
        console.log("User did not connect wallet!");
        return;
      }
    }

    let task = {
      taskText: input,
      isDeleted: false,
    };

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );

        const transactionResponse = await TaskContract.addTask(
          task.taskText,
          task.isDeleted
        );
        // await transactionResponse.wait();
        console.log("Transaction sent. Waiting for confirmation...");

        // Wait for the transaction to be confirmed
        const receipt = await transactionResponse.wait();
        console.log("Transaction confirmed:", receipt);
        console.log("Task added:", transactionResponse);
        setTask([...tasks, task]);

        // After confirming the transaction, fetch all tasks again
        await getAllTasks(); // Refresh the tasks list after adding a new task
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("Error submitting new task", error);
    }

    setInput("");
  };

  const deleteTask = (key) => async () => {
    console.log(key);

    // Now we got the key, let's delete our tweet
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );

        let deleteTaskTx = await TaskContract.deleteTask(key, true);
        await deleteTaskTx.wait();
        console.log("Task deleted, transaction confirmed:", deleteTaskTx);

        let allTasks = await TaskContract.getMyTasks();
        setTask(allTasks);
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="container">
        <form className="form">
          <div className="InputAndlabelContainer">
            <label>Add a new task</label>
            <input
              className="InputTask"
              type="text"
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </div>

          <div className="ButtonContainer">
            <button className="AddTaskBtn" onClick={AddTask}>
              manage Task
            </button>
            {/* <button className="CancelTask">Cancel</button> */}
          </div>
        </form>
      </div>

      <div className="container2">
        <div className="todo-container">
          <h5>
            To Do List ( <span>{tasks.length}</span> )
          </h5>
          {tasks.map((item, index) => (
            <Task
              key={index}
              taskText={item.taskText}
              // onClick={() => deleteTask(item.id)}
              onClick={deleteTask(item.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default App;
