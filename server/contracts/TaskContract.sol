// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract TaskContract {
    event AddTask(address recepient, uint taskId);
    event DeleteTask(uint taskId, bool isDeleted);

    struct Task {
        uint id;
        string taskText;
        bool isDeleted;
    }


    // an empty array
    Task[] private tasks;

    // mapping task to id 
    // This line of code is saying, "For each task number, I want to know which person (or address) owns it.
    mapping(uint256 => address) taskToOwner;


    // When you mark a function as external, it means that this function can only be called from outside the smart contract, such as by a user or another contract
    // This function stores your tasks in a structured way in a smart contract on the blockchain.
    function addTask(string memory taskText, bool isDeleted) external {
        uint taskId = tasks.length;

        tasks.push(Task(taskId, taskText, isDeleted));
        // this line adds task to the end of the tasklist with 3 parameters
        // taskId: The unique number for this task (likely used to identify it).
        // taskText: The description of the task (for example, "Buy groceries").
        // isDeleted: A boolean (true or false) indicating whether the task is deleted or not.
        taskToOwner[taskId] = msg.sender;
        // This is referring to the taskToOwner mapping, which keeps track of who owns each task.
        // This line is saying, "Assign ownership of the task (with the current taskId) to the person who called this function." In other words, it links the task to its creator.

        emit AddTask(msg.sender, taskId);


    }

    function getMyTasks() external view returns (Task[] memory) {
        Task[] memory temporary =  new Task[](tasks.length);
        uint counter = 0;
        for(uint i=0; i<tasks.length; i++){
            if(taskToOwner[i] == msg.sender && tasks[i].isDeleted == false){
                temporary[counter] = tasks[i];
                counter++; 
            }
        }

        Task[] memory result = new Task[](counter);
        for(uint i=0; i<counter; i++){
            result[i] =  temporary[i];
        }
        return result;

    }


    function deleteTask(uint taskId, bool isDeleted) external{
        if(taskToOwner[taskId] == msg.sender){
            tasks[taskId].isDeleted = isDeleted;
            emit DeleteTask(taskId, isDeleted);
        }
    }

}