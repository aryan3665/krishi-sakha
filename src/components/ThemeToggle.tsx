import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-10 w-10 rounded-full border-2 border-green-200 dark:border-green-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-yellow-500 group-hover:text-yellow-600" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-blue-400 group-hover:text-blue-500" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-green-200 dark:border-green-800 shadow-xl"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
        >
          <Sun className="mr-3 h-4 w-4 text-yellow-500" />
          <span className="font-medium">Light Mode</span>
          {theme === "light" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-green-500"></div>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
        >
          <Moon className="mr-3 h-4 w-4 text-blue-400" />
          <span className="font-medium">Dark Mode</span>
          {theme === "dark" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-green-500"></div>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
        >
          <Monitor className="mr-3 h-4 w-4 text-gray-500" />
          <span className="font-medium">System</span>
          {theme === "system" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-green-500"></div>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
