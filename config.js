import {
    @Vigilant,
    @TextProperty,
    @ColorProperty,
    @ButtonProperty,
    @SwitchProperty,
    @ParagraphProperty,
    @SliderProperty,
    @PercentSliderProperty,
    @DecimalSliderProperty,
    @SelectorProperty,
    Color
} from "../Vigilance/index";

@Vigilant("HoleInTheWall2")
class Settings {
    constructor() {
        this.initialize(this);
    }

    @SwitchProperty({
        name: "§aEnable HITW Helper",
        description: "Show blocks in Hole in the Wall.",
        category: "Settings"
    })
    hotw = true;

    @SwitchProperty({
        name: "§aToggle Title Message",
        description: "Display a message on screen when your placement is perfect.",
        category: "Settings"
    })
    title = true;

    @ColorProperty({
        name: "§aBlock Color",
        description: "Customize block color.",
        category: "Settings"
    })
    boxColor = new java.awt.Color(0, 0, 0, 0.1); 

    @ColorProperty({
        name: "§aWrong Block Color",
        description: "Customize block color.",
        category: "Settings"
    })
    boxColorBad = new java.awt.Color(0, 0, 0, 0.1); 

    @ColorProperty({
        name: "§aCorrect Block Color",
        description: "Customize block color.",
        category: "Settings"
    })
    boxColorGood = new java.awt.Color(0, 0, 0, 0.1); 
}

export default new Settings;
