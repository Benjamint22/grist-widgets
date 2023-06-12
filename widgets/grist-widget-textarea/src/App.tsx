import classes from "./App.module.css";
import { useGristRows } from "./main";

function App() {
  const { row } = useGristRows();
  return (
    <textarea
      className={classes.input}
      value={row?.text ?? ""}
      readOnly={true}
    />
  );
}

export default App;
