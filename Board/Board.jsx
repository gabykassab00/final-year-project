import Board, {
  moveCard,
  moveColumn,
  removeCard,
  addCard,
} from "@asseinfo/react-kanban";
import "@asseinfo/react-kanban/dist/styles.css";
import useBoard from "../../store/Board";
import "./Board.css";
import { RxCross2 } from "react-icons/rx";
import { IoMdAdd } from "react-icons/io";
import AddCardModal from "../../components/AddCardModal/AddCardModal";
import { useState } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  addDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

const BoardPage = () => {
  const [issuedDate, setIssuedDate] = useState(null);

  const { board, setBoard } = useBoard();

  const handleColumnMove = (_card, source, destination) => {
    const updatedBoard = moveColumn(board, source, destination);
    setBoard(updatedBoard);
  };
  const handleCardMove = async (_card, source, destination) => {
    console.log("Moving card:", _card, "from", source, "to", destination);

    const updatedBoard = moveCard(board, source, destination);
    console.log("Updated board:", updatedBoard);
    setBoard(updatedBoard);

    const db = getFirestore();
    const taskCollection = collection(db, "tasks");
    const querySnapshot = await getDocs(taskCollection);

    console.log("Query snapshot size:", querySnapshot.size);

    querySnapshot.forEach(async (doc) => {
      console.log("Checking document:", doc.data());
      console.log("Document ID:", doc.id);

      const cardId = _card.id;
      console.log("Card ID:", cardId);

      if (doc.id === cardId) {
        console.log("Found matching card in Firestore:", doc.data());

        try {
          console.log("Updating Firestore document...");
          await updateDoc(doc.ref, {
            columnId: destination.toColumnId, 
          });
          console.log("Firestore document updated successfully.");
        } catch (error) {
          console.error("Error updating task columnId in Firestore: ", error);
        }
      }
    });
  };

  const getColumn = (card) => {
    const column = board.columns.filter((column) =>
      column.cards.includes(card)
    );
    return column[0];
  };

  const getGradient = (card) => {
    const column = getColumn(card);
    const title = column.title;
    if (title === "TODO") {
      return {
        background:
          "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(48, 189, 220) 163.54%)",
      };
    } else if (title === "Doing") {
      return {
        background:
          "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(220, 48, 48) 163.54%)",
      };
    } else if (title === "Completed") {
      return {
        background:
          "linear-gradient(65.35deg, rgba(65, 65, 65, 0.67) -1.72%, rgba(48, 220, 86) 163.54%)",
      };
    } else if (title === "Backlog") {
      return {
        background:
          "linear-gradient(65.35deg, rgba(65, 65,65, 0.67) -1.72%,rgba(134, 48, 220) 163.54%)",
      };
    }
  };

  return (
    <div className="board-container">
      <span>Trello Board</span>

      <Board
        allowAddColumn
        allowRenameColumn
        allowRemoveCard
        onCardDragEnd={handleCardMove}
        onColumnDragEnd={handleColumnMove}
        renderCard={(props) => (
          <div className="kanban-card" style={getGradient(props)}>
            <div>
              <span>{props.title}</span>
              <button
                className="remove-button"
                type="button"
                onClick={() => {
                  const updatedBoard = removeCard(
                    board,
                    getColumn(props),
                    props
                  );
                  setBoard(updatedBoard);
                }}
              >
                <RxCross2 color="white" size={15} />
              </button>
            </div>
            <span>{props.description}</span>
            <span className="assigned-email">
              Assigned to: {props.assignedEmail}
            </span>
            <span className="issued-date">
              Issued Date:{" "}
              {props.issuedDate instanceof Date
                ? props.issuedDate.toLocaleDateString()
                : ""}
            </span>
          </div>
        )}
        renderColumnHeader={(props) => {
          const [modalOpened, setModalOpened] = useState(false);

          const handleCardAdd = async (title, detail, email, issuedDate) => {
            const card = {
              id: new Date().getTime(),
              title,
              description: detail,
              assignedEmail: email,
              issuedDate,
            };

            const updatedBoard = addCard(board, props, card);
            setBoard(updatedBoard);
            try {
              // const columnId = await getDoc().columnId;
              const db = getFirestore();
              const taskCollection = collection(db, "tasks");
              await addDoc(taskCollection, {
                title: card.title,
                detail: card.description,
                assignedTo: card.assignedEmail,
                issuedDate: card.issuedDate,
                // columnId,
              });
              console.log("Task added to Firestore");
            } catch (error) {
              console.error("Error adding task to Firestore: ", error);
            }
            setIssuedDate(issuedDate);
            setModalOpened(false);
          };

          return (
            <div className="column-header">
              <span>{props.title}</span>

              <IoMdAdd
                color="white"
                size={25}
                title="Add card"
                onClick={() => setModalOpened(true)}
              />
              <AddCardModal
                visible={modalOpened}
                handleCardAdd={(title, detail, email, date) => {
                  handleCardAdd(title, detail, email, date);
                  setIssuedDate(date); 
                  setModalOpened(false);
                }}
                onClose={() => setModalOpened(false)}
              />
            </div>
          );     
        }}
      >
        {board}
      </Board>
    </div>
  );
};

export default BoardPage;
