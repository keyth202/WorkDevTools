
export const buildLog = (buildDate:string) =>{
	
	console.log(`************** Build Date: ${buildDate} Prod************`);
}



export const saveToLocalStorageWithExpiry = (key:string, data:any, expiryTimeInMinutes:number) => {
    try {
        const now = new Date();
        const item = {
            value: data,
            expiry: now.getTime() + expiryTimeInMinutes * 60 * 1000,
        };
        localStorage.setItem(key, JSON.stringify(item)); 
    } catch (error) {
        console.error("Could not save to localStorage", error);
        
    }
    
};

export const loadFromLocalStorageWithExpiry = (key:string) => {
    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return undefined;

        const item = JSON.parse(itemStr);
        const now = new Date();


        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return undefined;
        }

        return item.value;
    } catch (error) {
        console.error("Could not load from localStorage", error);
        return undefined;
    }
    
};
