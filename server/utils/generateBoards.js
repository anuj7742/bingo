const BingoBoard = require('../models/board')

function generateBoards () {
    const columnRanges = [
        [1, 15],  /// For B
        [16, 30],  /// For I
        [31, 45],  /// For N
        [46,60],  /// For G
        [61, 75]  /// For O
    ]

    const board = [];
    let currentSum = 0;

    for (let col = 0; col < 5; col++){
        const count = col == 2 ? 4 : 5 // 'N' have only 4 numbers due to the free space in middle
        const range = columnRanges[col];
        const numbers = new Set();

        while(numbers.size < count ){
            const num = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
            // if the number is generated previously then do not add it
            if(!numbers.has(num)){
                numbers.add(num);
                currentSum += num;
            }
        }

        board.push(...numbers);
    }

    board.splice(12, 0, 0);

    // Now have to adjust the numbers to match the targeted sum
    // const diff = targetSum - currentSum;
    
    
    // if(diff != 0){
    //     for(let col = 4; col>=0; col--){
    //         const range = columnRanges[col];
    //         for(let row=0; row<5; row++){
    //             if(col == 2 && row == 2 ) continue;
    //             const index = col * 5 + row;
    //             const adjustedNumber = board[index] + diff;

    //             if(adjustedNumber >= range[0] && adjustedNumber <= range[1]){
    //                 board[index] = adjustedNumber;
    //                 return board;
    //             }
    //         }
    //     }

        
    // } 

    return [board, currentSum];
}

exports.boardEntry = async () =>{

    for(let i=0; i<10; i++){
        const [board, total]= generateBoards();
        
        const result = await BingoBoard.create({
            numbers: board,
            sum : total
        })
        console.log(result);
    }

}