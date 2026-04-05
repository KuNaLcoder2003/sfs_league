import { prisma } from "./prisma.js"

const teams = [
    { name: "Rana Pratap Panthers", color: "#f59e0b", emoji: "👑" },
    { name: "Bhagat Singh Warriors", color: "#ef4444", emoji: "⚔️" },
    { name: "Bose Stormers", color: "#ec4899", emoji: "🔥" },
    { name: "Azad Strikers", color: "#8b5cf6", emoji: "⚡" },
    { name: "Royal Rockstar Chava", color: "#06b6d4", emoji: "🌊" },
    { name: "Chatrapati Shivaji Kings", color: "#10b981", emoji: "🦁" },
    { name: "Laxmi Bai Legends", color: "#f97316", emoji: "🏹" },
];

const players = [
    { name: "Vaasu Agarwal", age: 13, mobile: "9376020486" },
    { name: "Yash Goyal", age: 15, mobile: "9314066512" },
    { name: "Shobhit Agrawal", age: 13, mobile: "9982451416" },
    { name: "Yashasvi Rai", age: 10, mobile: "7073909064" },
    { name: "Divit Singhvi", age: 11, mobile: "9784873553" },
    { name: "Kartik Mirchandani", age: 13, mobile: "7878753650" },
    { name: "Rick Sarkar", age: 14, mobile: "7300436450" },
    { name: "Yuvaan Gupta", age: 10, mobile: "9166147220" },
    { name: "Mohit Khatri", age: 16, mobile: "8905893281" },
    { name: "Trivid Goyal", age: 11, mobile: "9352432499" },
    { name: "Rahul Saini", age: 12, mobile: "7728043553" },
    { name: "Abhishek Saini", age: 16, mobile: "9649776204" },
    { name: "Jeetu Saini", age: 13, mobile: "9001435369" },
    { name: "Uday Raj Saini", age: 15, mobile: "7296909574" },
    { name: "Kshitij Sharma", age: 11, mobile: "9214315003" },
    { name: "Jatin Saini", age: 12, mobile: "9887606044" },
    { name: "Yuvraj Saini", age: 16, mobile: "8949457026" },
    { name: "Uday Raj Bhatia", age: 11, mobile: "7568087637" },
    { name: "Samarth Sangtani", age: 14, mobile: "9509437647" },
    { name: "Vivaan Kulshreshtha", age: 11, mobile: "9302373220" },
    { name: "Ahhaan Hargun", age: 10, mobile: "8107008851" },
    { name: "Atharv Dixit", age: 14, mobile: "9829224008" },
    { name: "Gatiz Sethi", age: 13, mobile: "8824133347" },
    { name: "Sourish Sharma", age: 9, mobile: "9314963438" },
    { name: "Jayaditya Jadeja", age: 14, mobile: "7580866400" },
    { name: "Gaurav Panchal", age: 15, mobile: "7877512127" },
    { name: "Shaurya Singh", age: 11, mobile: "7233890256" },
    { name: "Aryan Khatri", age: 13, mobile: "9829090788" },
    { name: "Harshit Arora", age: 12, mobile: "9818701064" },
    { name: "Vaibhav Sharma", age: 13, mobile: "9582216207" },
    { name: "Parag Saraiya", age: 10, mobile: "9672299201" },
    { name: "Liyan Jain", age: 10, mobile: "8890300909" },
    { name: "Vihaan Khatri", age: 12, mobile: "6375577957" },
    { name: "Shaanvi", age: 13, mobile: "7017557583" },
    { name: "Haardik Arora", age: 12, mobile: "9818701064" },
    { name: "Jiaansh Khatri", age: 11, mobile: "9983333996" },
    { name: "Ekaansh Khatri", age: 13, mobile: "9983333778" },
    { name: "Bhavini Sharma", age: 9, mobile: "9929732656" },
    { name: "Arav Mittal", age: 12, mobile: "9983331733" },
    { name: "Bhavya Pratap Singh", age: 11, mobile: "8209183373" },
    { name: "Jeenendra Pratap Singh", age: 11, mobile: "8811841752" },
    { name: "Nishtha Singh", age: 13, mobile: "8811841752" },
    { name: "Hemani", age: 13, mobile: "9680303983" },
    { name: "Diyan Aggarwal", age: 11, mobile: "9929999487" },
    { name: "Tushar Kumawat", age: 15, mobile: "9414323283" },
    { name: "Ravi Sain", age: 14, mobile: "9610688429" },
    { name: "Neerver", age: 10, mobile: "9829284412" },
    { name: "Anmol Singh", age: 12, mobile: "9829284412" },
    { name: "Lavesh Khatri", age: 9, mobile: "8852967317" },
    { name: "Priyansh", age: 13, mobile: "9782966829" },
    { name: "Dhananjay Khatri", age: 14, mobile: "9214507743" },
    { name: "Arnav Jain", age: 13, mobile: "9460068619" },
    { name: "Somya Swami", age: 12, mobile: "8769686010" },
    { name: "Vikas Saini", age: 15, mobile: "7374849456" },
    { name: "Rohit Trevedi", age: 15, mobile: "9799781299" },
    { name: "Aabhas Soni", age: 13, mobile: "7206630025" },
    { name: "Ranvijay Singh Naruka", age: 14, mobile: "8562057323" },
    { name: "Krishna Khatri", age: 15, mobile: "9352855769" },
    { name: "Jatin Khatri", age: 12, mobile: "8696593536" },
    { name: "Divyansh Sahewal", age: 15, mobile: "9784011370" },
    { name: "Yuvraj Madhu", age: 14, mobile: "8078607118" },
    { name: "Kavya Ailani", age: 14, mobile: "9636727758" },
    { name: "Yohaan Sharma", age: 12, mobile: "9929004415" },
    { name: "Pradeep Singh", age: 11, mobile: "9829999268" },
    { name: "Krishna Tanwar", age: 13, mobile: "8302313283" },
    { name: "Priyanshu Tanwar", age: 12, mobile: "8854030454" },
    { name: "Lakshya Sharma", age: 10, mobile: "8949321724" },
    { name: "Kavish Jain", age: 12, mobile: "9509834272" },
    { name: "Ayaan Agarwal", age: 13, mobile: "8696972012" },
    { name: "Bhavyansh Jhamtani", age: 13, mobile: "9784000408" },
    { name: "Rajveer Singh Rathore", age: 10, mobile: "7976917290" },
    { name: "Anand Kharol", age: 14, mobile: "6378848310" },
    { name: "Yashwant Saini", age: 12, mobile: "9660184514" },
    { name: "Vivan Saini", age: 11, mobile: "8387002512" },
    { name: "Gautam Saini", age: 15, mobile: "9050196819" },
    { name: "Ojas Sharma", age: 10, mobile: "9001065000" },
    { name: "Ajisth Jain", age: 14, mobile: "9928009111" },
    { name: "Varun Sewani", age: 13, mobile: "9784000408" },
    { name: "Poorvang Khatri", age: 11, mobile: "9602437474" },
];

async function main() {
    console.log("🌱 Seeding database...");

    await prisma.player.deleteMany();
    await prisma.team.deleteMany();

    for (const t of teams) {
        await prisma.team.create({ data: t });
    }
    console.log(`✅ Created ${teams.length} teams`);

    for (const p of players) {
        await prisma.player.create({ data: { ...p, status: "unsold" } });
    }
    console.log(`✅ Created ${players.length} players`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());