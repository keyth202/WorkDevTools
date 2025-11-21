import { db } from "./firebaseInitalize";
import { collection, addDoc, getDocs } from "firebase/firestore"; 

export const addDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
        company: data.company,
        eval_ins: data.eval_ins,
        eval_score: data.eval_score,
        eval_summary: data.eval_summary,
        transcript:data.transcript,
        evalId: crypto.randomUUID(),
    });

    console.log("Document written with ID: ", docRef.id);
    } catch (e) {
    console.error("Error adding document: ", e);
    }
}

export const readDocument = async (collectionName: string, company: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  querySnapshot.forEach((doc:any) => {
    console.log(`${doc.id} => ${doc.data()}`);
    console.log(doc);
  });

 const filteredData = querySnapshot.docs
    .map((doc: any) => doc.data()) 
    .filter((data: any) => data.company === company); 

  return filteredData;
}