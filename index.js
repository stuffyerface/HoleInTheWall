import RenderLib from "../RenderLib/index.js";
import Settings from "./config";
let highlightedBlocks = [];
let highlightedBlocksBad = [];
let highlightedBlocksGood = [];
let lever = [0, -10000, 0];
let enabled = false;

register("command", () => {
    ChatLib.command("play arcade_hole_in_the_wall");
}).setName("hitw");

register("command", () => {
    Settings.openGUI();
}).setName("holeinthewall");

register("tick", () => {
    if (Settings.hotw && checkGame("hole in the wall")) {
        enabled = true;
    }else{
        //Reset variables
        enabled = false;
        return;
    }
});

register("step", () => {
    if (!enabled){
        return;
    }
    let distCheck = calcDist(lever,[Player.getX(), Player.getY(), Player.getZ()]);
    if(distCheck > 15){
        //console.log("Too far away from lever, finding new one: " + distCheck);
        findLever(Player.getX(), Player.getY(), Player.getZ());
    }
}).setDelay(3);

register("step", () => {
    if (!enabled){
        return;
    }
    let bottomGlass;
    for(let x = -3; x <= 3; x++){
        for(let z = -3; z <= 3; z++){
            checker = checkBlock(lever[0] + x, lever[1]-1, lever[2] + z);
            //console.log(checker[0] + " " + checker[1] + " " + checker[2]);
            if(checker[3] == "Stained Glass"){
                bottomGlass = [checker[0], checker[1], checker[2]];
                break;
            }
        }
    }
    if(bottomGlass == undefined){
        //console.log("No bottom glass found.");
        return;
    }
    let topGlass;
    let height = 0;
    for(let y = 0; y <= 15; y++){
        checker = checkBlock(bottomGlass[0], bottomGlass[1] + y, bottomGlass[2]);
        if(checker[3] == "tile.air.name"){
            topGlass = [checker[0], checker[1]-1, checker[2]];
            height = y-2;
            break;
        }
    }
    if(topGlass == undefined){
        console.log("No top glass found.");
        return;
    }
    //Find the top cobblestone wall
    let topCobblestone;
    //console.log("checking")
    for(let x = -10; x <= 10; x++){
        checker = checkBlock(topGlass[0] + x, topGlass[1]+1, topGlass[2]);
        if(checker[3] == "Cobblestone Wall" || checker[3] == "Mossy Cobblestone Wall"){
            topCobblestone = [checker[0], checker[1], checker[2]];
            break;
        }
    }
    if(topCobblestone == undefined){
        for(let z = -10; z <= 10; z++){
            checker = checkBlock(topGlass[0], topGlass[1]+1, topGlass[2] + z);
            //console.log(checker[3]);
            if(checker[3] == "Cobblestone Wall" || checker[3] == "Mossy Cobblestone Wall"){
                topCobblestone = [checker[0], checker[1], checker[2]];
                break;
            }
        }
    }
    if(topCobblestone == undefined){
        //console.log("No top cobblestone found.");
        return;
    }
    let xoffset = 0;
    let zoffset = 0;
    for(let x = -1; x <= 1; x++){
        if(x == 0){
            continue;
        }
        checker = checkBlock(topCobblestone[0] + x, topCobblestone[1], topCobblestone[2]);
        if(checker[3] == "Cobblestone Wall"){
            xoffset = x;
            break;
        }
    }
    if(xoffset != 0){
        for(let z = -1; z <= 1; z++){
            if(z == 0){
                continue;
            }
            checker = checkBlock(topCobblestone[0], topCobblestone[1], topCobblestone[2] + z);
            if(checker[3] == "Cobblestone Wall"){
                zoffset = z;
                break;
            }
        }
    }
    if(xoffset == 0 && zoffset == 0){
        //console.log("No top cobblestone found.");
        return;
    }
    let distance;
    let templateWall;
    for(let x = 0; x<= 30; x++){
        checker = checkBlock(topCobblestone[0] + xoffset*x, topCobblestone[1]-1, topCobblestone[2] + zoffset*x);
        if(checker[3] == "Cobblestone Wall"){
            distance = x;
            templateWall = checker;
            break;
        }
    }
    if(distance == undefined){
        //console.log("No distance cobblestone found.");
        return;
    }
    let width = Math.abs(topCobblestone[0] - bottomGlass[0] + topCobblestone[2] - bottomGlass[2])*2 - 1;
    //console.log("width: " + width);
    //console.log("height: " + height);

    clearHighlightedBlocks();
    halfwidth = Math.floor(width/2);
    let finished = true;
    for(let x = -halfwidth; x <= halfwidth; x++){
        for(let y = 0; y < height; y++){
            checkCutout = checkBlock(templateWall[0] + zoffset*x, templateWall[1] -y -1, templateWall[2] + xoffset*x);
            checkCanvas = checkBlock(topCobblestone[0] + zoffset*x, topCobblestone[1] -y -2, topCobblestone[2] + xoffset*x);
            if(checkCutout[3] == "tile.air.name" && checkCanvas[3] == "Stained Glass"){
                highlightedBlocksGood.push([checkCanvas[0], checkCanvas[1], checkCanvas[2]]);
            }
            if(checkCutout[3] == "tile.air.name" && checkCanvas[3] == "tile.air.name"){
                finished = false;
                highlightedBlocks.push([checkCanvas[0], checkCanvas[1], checkCanvas[2]]);
            }
            if(checkCutout[3] == "Stained Clay" && checkCanvas[3] == "Stained Glass"){
                finished = false;
                highlightedBlocksBad.push([checkCanvas[0], checkCanvas[1], checkCanvas[2]]);
            }
        }
    }
    if(finished && checkInGame() && Settings.title){
        Client.showTitle("", "§a§lCOMPLETE!§e flick the lever.", 0, 6, 0);
    }
}).setFps(5);

function checkGame(game) {
    return Scoreboard.getTitle().removeFormatting().toLowerCase().includes(game.toLowerCase());
}

function checkInGame() {
    let lines = Scoreboard.getLines();
    let bool = false;
    for (let i = 0; i < lines.length; i++) {
        currLine = lines[i].toString().removeFormatting().toLowerCase();
        if(currLine.includes("wall")){
            bool = true;
        }
    }
    return bool;
}

function calcDist(loc1, loc2){
    return Math.sqrt(Math.pow(loc1[0]-loc2[0], 2) + Math.pow(loc1[1]-loc2[1], 2) + Math.pow(loc1[2]-loc2[2], 2));
}

function checkBlock(x, y, z){
    newx = Math.round(x-.5);
    newy = Math.round(y-.5);
    newz = Math.round(z-.5);
    //console.log(newx, newy, newz);
    //highlightedBlocks[0] = [newx, newy, newz];
    try{
    block = World.getBlockAt(newx, newy, newz).getType().getName().toString();
    }catch(e){
        console.error(e);
        return [newx, newy, newz, "null"];
    }
    return [newx, newy, newz, block];
}

function findLever(x, y, z){
    //console.log("Finding Lever")
    range = 10;
    for(i = -range; i <= range; i++){
        for(j = -range; j <= range; j++){
            for(k = -range; k <= range; k++){
                checking = checkBlock(x+i, y+j, z+k);
                if(checking[3] == "Lever"){
                    lever = [checking[0], checking[1], checking[2]];
                    //highlightedBlocksGood[0] = [checking[0], checking[1], checking[2]];
                    //console.log("Lever found: " + lever);
                    return;
                }
            }
        }
    }
}

function clearHighlightedBlocks(){
    highlightedBlocks = [];
    highlightedBlocksGood = [];
    highlightedBlocksBad = [];
}

register("renderWorld", () => {
    if (enabled) {
        for(x in highlightedBlocks){
            RenderLib.drawInnerEspBox(highlightedBlocks[x][0]+.5, highlightedBlocks[x][1], highlightedBlocks[x][2]+.5, 0.9, 0.9, Settings.boxColor.getRed()/255, Settings.boxColor.getGreen()/255, Settings.boxColor.getBlue()/255, Settings.boxColor.getAlpha()/255, true);
        }
        for(x in highlightedBlocksBad){
            RenderLib.drawInnerEspBox(highlightedBlocksBad[x][0]+0.5, highlightedBlocksBad[x][1], highlightedBlocksBad[x][2]+0.5, 0.9, 0.9, Settings.boxColorBad.getRed()/255, Settings.boxColorBad.getGreen()/255, Settings.boxColorBad.getBlue()/255, Settings.boxColorBad.getAlpha()/255, true);
        }
        for(x in highlightedBlocksGood){
            RenderLib.drawInnerEspBox(highlightedBlocksGood[x][0]+0.5, highlightedBlocksGood[x][1], highlightedBlocksGood[x][2]+0.5, 0.9, 0.9, Settings.boxColorGood.getRed()/255, Settings.boxColorGood.getGreen()/255, Settings.boxColorGood.getBlue()/255, Settings.boxColorGood.getAlpha()/255, true);
        }
    }
});
