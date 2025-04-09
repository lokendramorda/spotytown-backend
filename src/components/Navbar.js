import { Link } from 'react-router-dom';
import {
  Navbar,
  Typography,
} from "@material-tailwind/react";

export function NavbarDark() {
  const navItems = [
    { label: "SPOTY TOWN", href: "/", variant: "h6" },
    { label: "posts", href: "/posts", variant: "h6" },
  ];

  return (
    <Navbar 
        variant="gradient"
        color="green"
        className=" mx-auto max-w-screen-xl from-green-700 to-black-800 px-4 py-3"
      >
      <div className="flex flex-wrap items-center justify-between gap-y-4 text-white">
        {navItems.map((item, index) => (
          <Typography
            key={index}
            as={Link}  
            to={item.href}  
            variant={item.variant}
            className={`cursor-pointer py-1.5 ${
              index === 0 ? "mr-4 ml-2" : 
              index === 1 ? "mr-4 ml-auto" : 
              "mr-4 ml-2"
            }`}
          >
            {item.label}
          </Typography>
        ))}
      </div>
    </Navbar>
  );
}
