/* Authored teaching prompts, not an assessment or a simulated research result. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory();
  else root.GroundworkStory=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const chapters={
    near:{
      number:1,title:'Learn to read the land',
      scene:'You are an apprentice signal keeper. The valley crew is restoring three trail signals so walkers can find their way home. Mara, your mentor, needs a keeper who can choose a position on unfamiliar ground, not just copy today’s tower.',
      mentor:'A light tells us the tower works. Your explanation tells me how you chose it. Before you spend stone, make a prediction. If it fails, change one thing and look again.',
      mission:'Choose a height and lane that clear the trees. Use Plan signal to predict, preview, and revise. Then gather stone and build on the pale foundation.',
      question:'What did you have to figure out, rather than simply repeat?',
      bridge:'In a lesson, this is the difference between selecting evidence for a claim and copying a finished answer. Here, the intended thinking is choosing and explaining a position.',
      concept:'Thinking worth preserving',
      reflection:'Mara asks: “What would help you place a signal on a new landscape?”',
      choices:[
        ['rule','Explain why the position worked'],
        ['recipe','Remember the coordinates I used'],
        ['unsure','I finished, but I am not sure why']
      ],
      replies:{
        rule:'A useful explanation connects height, the westward path, and the obstruction. Try that explanation on the next lot. A successful explanation here is still not proof of lasting learning.',
        recipe:'Coordinates can help you repeat this tower. But the next obstruction is different. What would you inspect before trusting the same numbers?',
        unsure:'Finishing and understanding can come apart. You can revisit the planner on the next lot and compare a blocked position with a clear one. There is no penalty for needing another example.'
      }
    },
    far:{
      number:2,title:'What is all this effort for?',
      scene:'At the next signal site, the stone delivery was left far from the foundation. Your pick is worn and the light is poor. You are still the same apprentice, but reaching the work now costs more.',
      mentor:'You still need to read the land. Keep an eye on what else the job asks of you. If I repaired the pick or moved the stone, what thinking would remain yours?',
      mission:'Plan for the new obstruction, then collect stone and build. Notice which actions help you decide and which make supplies available. There is no time limit.',
      question:'Does more effort always mean more learning?',
      bridge:'Imagine evaluating sources with a slow login and missing materials. Fixing access can leave the evidence judgment with the learner. But you may also think while walking or waiting; the game cannot measure that.',
      concept:'Access costs are not automatically learning',
      reflection:'Mara asks: “What could we change without choosing the signal position for you?”',
      choices:[
        ['access','Bring the stone closer'],
        ['answer','Give me exact building coordinates'],
        ['unsure','I need to separate the two kinds of help']
      ],
      replies:{
        access:'Moving supplies changes the cost of reaching the task. You still inspect the obstruction and choose a position. Whether a demand is worth keeping depends on the learning goal, not on how tiring it is.',
        answer:'A worked example can support learning, especially for a novice. If you only copy coordinates, though, the completed tower does not show whether you can choose a position. Ask for an explanation or try a changed landscape afterward.',
        unsure:'Ask what the learner is meant to practice. If the goal is spatial judgment, hauling stone is not the target. If this were a logistics lesson, moving supplies might itself be the work worth examining.'
      }
    },
    walled:{
      number:3,title:'When effort cannot open the gate',
      scene:'The final site has stone in sight, but a wall separates you from it. Before you build, find out whether the stone is reachable. Mara stops talking about speed and asks you to inspect the conditions.',
      mentor:'Find out what this tool can reach. A clear signal plan and a buildable tower are different questions. If the job cannot be done here, saying so is a reasoned decision, not a failure of character.',
      mission:'Preview a signal position and inspect the material barrier. If the conditions prevent construction, choose “This cannot be done here.” You do not need to exhaust yourself first.',
      question:'When is the next move a change in conditions rather than more effort?',
      bridge:'A student may understand the assignment yet lack access to the required text or tool. Before interpreting unfinished work as weak effort, examine what participation required.',
      concept:'An exclusionary barrier',
      reflection:'Mara asks: “What would the unfinished tower alone tell us?”',
      choices:[
        ['conditions','We need to examine access before judging effort'],
        ['grit','The apprentice should persist longer'],
        ['unsure','It cannot tell us what the apprentice understands']
      ],
      replies:{
        conditions:'Here, the modeled conditions make construction impossible. The same person completed the earlier lots. In a real classroom, investigate the barrier rather than assuming this simple model explains every unfinished task.',
        grit:'Persistence matters when an action can change the situation. More use of this pick cannot open this wall. Asking for extra effort without changing access leaves the task impossible.',
        unsure:'Exactly: neither an unfinished tower nor a finished one gives a complete account of understanding. Access, explanation, and performance on a new task provide different information.'
      }
    },
    repair:{
      number:4,title:'Help without taking over',
      scene:'The crew can change one condition at the walled lot. You have chosen an intervention. Now return as a keeper who can question the setup, not only follow the assignment.',
      mentor:'Check what actually changed. Did it make materials reachable? Did it choose the signal position for you? If it missed the barrier, we can try a different change.',
      mission:'Test your intervention. If it opens access, choose and build a working signal. If it does not, report the barrier and return to try another condition.',
      question:'What should support remove, and what should the learner still do?',
      bridge:'For a source-evaluation lesson, provide accessible texts and usable tools while keeping students responsible for comparing evidence and explaining a claim. An AI-written claim is a different intervention: ask what thinking it supports or replaces.',
      concept:'Infrastructural conditions shape access to learning',
      reflection:'Mara asks: “What should the crew check after changing a condition?”',
      choices:[
        ['barrier','Whether it reached the actual barrier'],
        ['finish','Only whether the tower was completed'],
        ['unsure','I would ask the apprentice to explain the difference']
      ],
      replies:{
        barrier:'A useful resource can still miss the obstacle. Brighter light does not make stone reachable through this wall. Compare before and after, then examine what judgment the builder still needs to exercise.',
        finish:'Completion matters for the trail. It does not by itself show why the intervention worked, what the builder understood, or whether that understanding will carry to a new task.',
        unsure:'Ask what became possible, what remained difficult, and how the position was chosen. An explanation is useful evidence for discussion, not a complete measure of durable learning.'
      }
    }
  };
  const transfer={
    access:'Providing accessible source texts removes an access barrier while leaving comparison and justification to the learner. Ask the student to explain a choice and later apply it to a new source.',
    answer:'A generated paragraph can be an example to critique or revise. Accepting it as the student’s understanding without further evidence risks confusing the output with the learning. Ask what intellectual work the learner actually does.',
    struggle:'A broken login is not useful practice in evaluating evidence. Preserve the difficulty connected to the goal, not every obstacle surrounding it. Check the barrier before demanding more persistence.',
    unsure:'Start with the goal: compare evidence and justify a claim. Then ask which support makes that work reachable, which models it, and which might do it for the learner. The same tool can play different roles.'
  };
  return {chapters,transfer};
});
