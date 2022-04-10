import RenderLib from "../RenderLib/index.js";
import Settings from "./config";
const highlightedBlocks = [[99, 41, -67]];
const highlightedBlocksBad = [[99, 41, -66]];
const highlightedBlocksGood = [[99, 41, -65]];
let lever = [0, -10000, 0];
let width = 0;
let height = 0;
let plane = "null";

register("command", () => {
    ChatLib.chat(highlightedBlocks.toString())
}).setName("debug")

register("command", () => {
    ChatLib.command("play arcade_hole_in_the_wall");
}).setName("hitw");

register("command", () => {
    Settings.openGUI();
}).setName("holeinthewall");

register("tick", () => {
    if (Settings.hotw && checkGame("hole in the wall")) {
        hitwSolver();
    }else{
        // clear the highlighted blocks
        return;
    }
})

function checkGame(game) {
    //console.log(Scoreboard.getTitle().removeFormatting().toLowerCase().includes(game.toLowerCase()))
    return Scoreboard.getTitle().removeFormatting().toLowerCase().includes(game.toLowerCase())
}

function hitwSolver() {
    if (!Settings.hotw){
        return;
    }
    if (!checkGame("hole in the wall")){
        return;
    }
    grid = findGrid();
    highlightedBlocks(grid);
    // find the placement grid (with orientation, coords of top wall)
    //   ex: [ xoffset, zoffset, top wall, [[true, true, true], [false, false, false]] ]
    //  height, width, rotation, top wall, grid
    return;
}
/* THIS IS BROKEN FIX IT
function highlightedBlocks(grid) {
    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid[i].length; j++){
            if(grid[i][j][0] === "good"){
                highlightedBlocksGood.push([grid[i][j][1], grid[i][j][2], grid[i][j][3]]);
            }else if(grid[i][j][0] === "bad"){
                highlightedBlocksBad.push([grid[i][j][1], grid[i][j][2], grid[i][j][3]]);
            }else if(grid[i][j][0] === "highlight"){
                highlightedBlocks.push([grid[i][j][1], grid[i][j][2], grid[i][j][3]]);
            }
        }
    }
   return;
}
*/


function calcDist(loc1, loc2){
    return Math.sqrt(Math.pow(loc1[0]-loc2[0], 2) + Math.pow(loc1[1]-loc2[1], 2) + Math.pow(loc1[2]-loc2[2], 2));
}

function findLever(x, y, z) {
    let searchRange = 10;
    for(var a = -searchRange; a <= searchRange; a++){
        for(var b = -searchRange; b <= searchRange; b++){
            for(var c = -searchRange; c <= searchRange; c++){
                console.log(a, b, c);
                //console.log(World.getBlockAt(x+a, y+b, z+c).getType().getName());
                if(World.getBlockAt(x+a, y, z+b).getType().getName().toString() === "Lever"){
                    lever = [x+a-.5, y-.5, z+b+.5];
                    //highlightedBlocks.push(lever)
                    return true;
                }
            }
        }
    }
    return false;
}

function findGridHelper(lever){
    let x = lever[0];
    let y = lever[1];
    let z = lever[2];
    let grid = [];
    let selected = [];
    width = 0;
    height = 0;
    plane = "null";
    distance = 0;
    for(let a=-1; a<=1; a++){
        for(let b=-1; b<=1; b++){
            if(World.getBlockAt(x+a, y, z+b).getType().getName().toString() === "Stained Glass"){
                selected = [x+a, y, z+b];
            }
        }
    }
    for(let i=0; i<=10; i++){
        if(World.getBlockAt(selected[0], selected[1]+i, selected[2]).getType().getName().toString() === "Air"){
            selected = [selected[0], selected[1]+i, selected[2]];
            // The air block above the stained glass
            height = i-2;
            break;
        }
        throw "Could not find grid (No air found)";
    }
    for(let dx = -5; dx <= 5; dx++){
        for(let dz = -5; dz <= 5; dz++){
            if(World.getBlockAt(selected[0]+dx, selected[1],selected[2]).getType().getName().toString() === "Cobblestone Wall"){
                selected = [selected[0]+dx, selected[1], selected[2]];
                // The first cobblestone wall
                width = Math.abs(dx)*2-1;
                dz = 0;
                break;
            }
            if(World.getBlockAt(selected[0], selected[1],selected[2]+dz).getType().getName().toString() === "Cobblestone Wall"){
                selected = [selected[0], selected[1], selected[2]+dz];
                // The first cobblestone wall
                width = Math.abs(dz)*2-1;
                dx = 0;
                break;
            }
            throw "Could not find grid (No cobblestone wall found)";
        }
    }
    //find the hanging wall
    let pattern = [];
    for(let i = -20; i <= 20; i++){
        for(let j = -20; j <= 20; j++){
            if(World.getBlockAt(selected[0]+i, selected[1]-1, selected[2]).getType().getName().toString() === "Cobblestone Wall"){
                selected = [selected[0]+i, selected[1]-1, selected[2]];
                // Wall above the pattern
                plane = "z";
                distance = i;
                break;
            }
            if(World.getBlockAt(selected[0], selected[1]-1, selected[2]+j).getType().getName().toString() === "Cobblestone Wall"){
                selected = [selected[0], selected[1]-1, selected[2]+j];
                // Wall above the pattern
                plane = "x";
                distance = j;
                break;
            }
        }
    }
    if(plane === "null"){
        throw "Could not find grid (No wall above pattern found)";
    }
    if(plane === "x"){
        for(let i = height; i >=0; i--){
            let row = [];
            for(let i = -(width-1)/2; i <= (width-1)/2; i++){
                if(World.getBlockAt(selected[0]+i, selected[1]+i, selected[2]).getType().getName().toString() === "air"){
                    row.push(false);
                }else{
                    row.push(true);
                }
            }
            pattern.push(row);
        }
    }else{
        for(let i = height; i >=0; i--){
            let row = [];
            for(let i = -(width-1)/2; i <= (width-1)/2; i++){
                if(World.getBlockAt(selected[0], selected[1]+i, selected[2]+i).getType().getName().toString() === "air"){
                    row.push(false);
                }else{
                    row.push(true);
                }
            }
            pattern.push(row);
        }
    }
    //compare the pattern to what is placed
    for(let i = height; i >=0; i--){
        let row = [];
        for(let j = -(width-1)/2; j <= (width-1)/2; j++){
            if(pattern[height-i][j]){
                if(World.getBlockAt(selected[0]+j, selected[1]+i, selected[2]).getType().getName().toString() === "air"){
                    row.push(["highlight",selected[0]+j, selected[1]+i, selected[2]]);
                }else{
                    row.push(["good",selected[0]+j, selected[1]+i, selected[2]]);
                }
            }else{
                if(World.getBlockAt(selected[0]+j, selected[1]+i, selected[2]).getType().getName().toString() === "air"){
                    row.push(["dont",selected[0]+j, selected[1]+i, selected[2]]);
                }else{
                    row.push(["bad",selected[0]+j, selected[1]+i, selected[2]]);
                }
            }
        }
        grid.push(row);
    }
    return grid;
}

function findGrid() {
    let dist = calcDist(lever,[Player.getX(), Player.getY(), Player.getZ()]);
    ChatLib.chat("Distance: " + dist);
    if(dist > 10){
        // find new lever and grid
        lever = findLever(Player.getX(), Player.getY(), Player.getZ());
        if(!lever){
            ChatLib.chat(lever);
            ChatLib.chat("Could not find lever");
            return false;
        }
        return findGridHelper(lever);
    }else{
        return;
    }
}    

register("renderWorld", () => {
    if (Settings.hotw && checkGame("hole in the wall")) {
        for(x in highlightedBlocks){
            RenderLib.drawInnerEspBox(highlightedBlocks[x][0]+0.5, highlightedBlocks[x][1], highlightedBlocks[x][2]+0.5, 0.9, 0.9, Settings.boxColor.getRed()/255, Settings.boxColor.getGreen()/255, Settings.boxColor.getBlue()/255, Settings.boxColor.getAlpha()/255, true);
        }
        for(x in highlightedBlocksBad){
            RenderLib.drawInnerEspBox(highlightedBlocksBad[x][0]+0.5, highlightedBlocksBad[x][1], highlightedBlocksBad[x][2]+0.5, 0.9, 0.9, Settings.boxColorBad.getRed()/255, Settings.boxColorBad.getGreen()/255, Settings.boxColorBad.getBlue()/255, Settings.boxColorBad.getAlpha()/255, true);
        }
        for(x in highlightedBlocksGood){
            RenderLib.drawInnerEspBox(highlightedBlocksGood[x][0]+0.5, highlightedBlocksGood[x][1], highlightedBlocksGood[x][2]+0.5, 0.9, 0.9, Settings.boxColorGood.getRed()/255, Settings.boxColorGood.getGreen()/255, Settings.boxColorGood.getBlue()/255, Settings.boxColorGood.getAlpha()/255, true);
        }
    }
});