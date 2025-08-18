import "./loading.scss";
import { Loader2 } from "lucide-react";

export default function LoadingData({ size = "medium", text = "Loading..." }) {
  return (
    <div className={`loading loading--${size}`}>
      <Loader2 className="loading__spinner" />
      <span className="loading__text">{text}</span>
    </div>
  );
}
