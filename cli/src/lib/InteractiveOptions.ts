import readline from "node:readline";

function asyncQuestion(question: string, reader: readline.Interface): Promise<string> {
   return new Promise((resolve, reject) => {
      reader.question(question, answer => {
         resolve(answer);
      });
   });
}

export default class InteractiveOptions {
   constructor(
      private questions: Array<{
         type: "yesno" | "input";
         name: string;
         question: string;
         default?: any;
         validate?: (input: any) => string;
      }>
   ) {}

   async run() {
      const answers: Record<string, any> = {};

      const reader = readline.createInterface({
         input: process.stdin,
         output: process.stdout,
      });

      async function askQuestion(question: any) {
         let default_indicator;

         switch (question.type) {
            case "yesno":
               if (question.default) {
                  default_indicator = " (Y/n): ";
               } else {
                  default_indicator = " (y/N): ";
               }
               break;
            case "input":
               default_indicator = " (" + question.default + "): ";
               break;
         }
         let answer = (await asyncQuestion(question.question + default_indicator, reader)) as any;

         if (question.type === "yesno") {
            answer = answer.toLowerCase();
            if (answer === "y" || answer === "yes") {
               answer = true;
            } else if (answer === "n" || answer === "no") {
               answer = false;
            } else {
               answer = question.default;
            }
         }

         if (answer === "") {
            answer = question.default;
         }

         const error = question.validate && question.validate(answer);

         if (error) {
            console.log("[ERROR]", error);
            return askQuestion(question);
         }

         return answer;
      }

      for (let question of this.questions) {
         const answer = await askQuestion(question);
         answers[question.name] = answer;
      }

      reader.close();

      return answers;
   }
}
