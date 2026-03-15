import { Sun, Moon } from "lucide-react";
import "./changemode.css";

/* 
  Props for the ChangeMode component 
*/
interface ChangeModeProps {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * A toggle switch for switching between light and dark themes.
 * @param param0 ]
 * @returns 
 */
const ChangeMode: React.FC<ChangeModeProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      <div className={`toggle-indicator ${theme}`} />

      <Moon
        size={18}
        className={`toggle-icon left ${theme === "dark" ? "active" : ""}`}
      />

      <Sun
        size={18}
        className={`toggle-icon right ${theme === "light" ? "active" : ""}`}
      />
    </div>
  );
};

export default ChangeMode;