# Text Planner

Text Planner is an infinite canvas to layout your ideas on. You can navigate everything using just your keyboard. It is highly extensible with a command system that doesn't limit you to what the software was designed to do.

## Commands

Commands allow you to do just about anything in Text Planner. They let you do simple stuff like create a new rectangle (`:new rect`), and in the next update will let you do more complicated things like bind shape properties to commands (`:bind @c "position/x" (get @3 "bounds/top-left")`). Their syntax is designed to be simple to learn, but not hold you back.

## Roadmap

- Finish parser upgrades
- Add command binding
- Add easy binding with snapping
- Add help & preference documents
- Add scripting support
