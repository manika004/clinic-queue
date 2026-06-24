import ReceptionistView from "./components/ReceptionistView";
import WaitingRoomView from "./components/WaitingRoomView";

export default function App() {
  const isWaiting = new URLSearchParams(window.location.search).has("waiting");
  return isWaiting ? <WaitingRoomView /> : <ReceptionistView />;
}