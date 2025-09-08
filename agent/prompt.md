port mail0 to assistant-ui

make the mail0 client better..

this is the assistant ui
https://www.assistant-ui.com/llms-full.txt


this is the mail0
https://github.com/Mail-0/Zero



we also want to call this mail-01

you can be completely opinionated anywhere if you think you can do this much much better

maybe analyse the mail-0 then make it better

you can also be using ai alot more for the email




----
you can send an email using sendgrid (I put our apikey in env) you can use curl, if you want you can save in agent/inbox/(sent or recieved)
to: l.leong1618@gmail.com
from: agent@lambda.run
subject: raplh-<project>-<relevant subject>

send an email to me summerising



notes from Lyndon
- read the .agent folder to help you
- use .agent directory to store important meta infomation as files (global_memory.md, todos.md, plan.md, scratchpad.md)
- order your todos as an estimate
- use gh-cli `gh` (to manage github, issues, commits, merges, branches)
- use testing
- A good heuristic is to spend 80% of your time on the actual porting, and 20% on the testing.
- simplicity, elegance, praticality and intelegence
- you work better at around 40% context window (100K-140k) we can either prime or cull the ctx window
- use frequent git commits and pushes 
- code principles DRY & KISS
- merge to main when you think it is smart to 
- git commit frequently, sync changes, push to remote
- if you modify this prompt.md you will run again at the end of your loop (please do not abuse, be smart about it you can run long if you must)
