export const TProperties = [
  {
    name: "",
    items: [
      {
        name: "auto remove children",
        type: "boolean",
        default: "true",
        info: "Automatically removes completed child animations from a parent timeline to optimize memory",
      },
      {
        name: "delay",
        type: "number",
        unit: "",
        info: "Delays the timeline start by the specified value (in seconds)",
      },
      {
        name: "repeat",
        type: "number",
        info: "Repeats the timeline a specified number of times, receiving a numeric value for the repeat count",
      },
      {
        name: "repeat delay",
        type: "number",
        unit: "",
        info: "Sets a delay between each repeat of the timeline, receiving a numeric value (in seconds) for the delay duration",
      },
      {
        name: "yoyo",
        type: "boolean",
        default: "true",
        info: "Reverses the timeline’s playback direction after each repeat, receiving a boolean (true) or a numeric value for the yoyo effect.",
      },
    ],
  },
];

export const AProperties = [
  {
    name: "",
    items: [
      {
        name: "x",
        type: "number",
        info: "Map input values to x-axis positions using linear mapping, e.g., input 50 (range 0-100) maps to x = 250px (range 0-500)",
      },
      {
        name: "y",
        type: "number",
        info: "Map input values to y-axis positions using linear mapping, e.g., input 50 (range 0-100) maps to y = 250px (range 0-500).",
      },
      {
        name: "opacity",
        type: "number",
        info: "Set opacity directly using received value (0 to 1)",
      },
      {
        name: "width",
        type: "string",
        info: "Width defines the horizontal size of an element",
      },
      {
        name: "height",
        type: "string",
        info: "Height defines the vertical size of an element",
      },
      {
        name: "scale",
        type: "number",
        info: "Scale resizes an element, e.g., 1.5 increases size by 1.5 times",
      },
      {
        name: "repeat",
        type: "number",
        info: "Repeat makes animations loop, e.g., 2 loops animation 2 times",
      },
      {
        name: "rotate",
        type: "string",
        info: "Rotate animates rotation, e.g., 180 rotates the element 180 degrees",
      },
      {
        name: "rotateX",
        type: "string",
        info: "Rotates the element around the X-axis in 3D space. For example, 180 creates a vertical flip effect.",
      },
      {
        name: "rotateY",
        type: "string",
        info: "Rotates the element around the Y-axis in 3D space. For example, 180 creates a horizontal flip effect.",
      },
      {
        name: "transformOrigin",
        type: "string",
        info: "Sets the origin point for transformations like scale and rotate, using values like 'center center', 'top left', or '50% 50%'.",
      },
      {
        name: "color",
        type: "color",
        info: "Color animates color changes, e.g., '#ff0000' changes text color to red",
      },
      {
        name: "background",
        type: "color",
        info: "Background animates background color, e.g., '#ff0000' changes background to red",
      },
      {
        name: "border",
        type: "string",
        info: "Border animates border properties, e.g., '2px solid #ff0000'",
      },
      {
        name: "boxShadow",
        type: "string",
        info: "BoxShadow animates shadow effects, e.g., '0px 4px 10px rgba(0,0,0,0.5)' adds a shadow",
      },
      {
        name: "ease",
        type: "ease",
        default: "power2.out",
        info: "Ease controls animation speed, e.g., 'ease-in' starts animation slow and speeds up",
      },
      {
        name: "force3D",
        type: "boolean",
        default: "true",
        info: "Force3D forces 3D rendering, e.g., true improves performance by using hardware acceleration",
      },
      {
        name: "delay",
        type: "number",
        unit: "",
        info: "Delay sets a pause before starting the animation, e.g., 2 waits 2 seconds before animating",
      },
      {
        name: "duration",
        type: "number",
        info: "Duration defines animation length, e.g., 2 makes the animation last 2 seconds",
      },
      {
        name: "currentTime",
        type: "number",
        info: "CurrentTime defines the current playback position of the animation, e.g., 1.5 means 1.5 seconds into the animation",
      },
      {
        name: "maxWidth",
        type: "string",
        info: "Max width animates the maximum width, e.g., '500px' increases max width to 500px",
      },
      {
        name: "maxHeight",
        type: "string",
        info: "Max height animates the maximum height, e.g., '400px' increases max height to 400px",
      },
      {
        name: "minWidth",
        type: "string",
        info: "Min width animates the minimum width, e.g., '500px' increases max width to 500px",
      },
      {
        name: "minHeight",
        type: "string",
        info: "Min height animates the minimum height, e.g., '400px' increases max height to 400px",
      },
      {
        name: "mixBlendMode",
        type: "string",
        info: "Mix blendMode controls blending of elements, e.g., 'multiply' blends the element with a darkening effect",
      },
      {
        name: "padding",
        type: "string",
        info: "Padding animates padding, e.g., '20px' increases padding to 20px",
      },
      {
        name: "radius",
        type: "string",
        info: "Radius animates corners, e.g., '50%' makes the element fully round",
      },
      {
        name: "repeatDelay",
        type: "number",
        info: "Repeat delay sets delay between repeats, e.g., 1 adds 1 second pause between repetitions",
      },
      {
        name: "scaleX",
        type: "number",
        info: "ScaleX animates horizontal scaling, e.g., 2 doubles the width of the element",
      },
      {
        name: "scaleY",
        type: "number",
        info: "ScaleY animates vertical scaling, e.g., 1.5 increases the height by 1.5 times",
      },
      {
        name: "xPercent",
        type: "number",
        info: "XPercent moves an element horizontally as a percentage, e.g., 50 moves the element 50% of its width",
      },
      {
        name: "yPercent",
        type: "string",
        info: "YPercent moves an element vertically as a percentage, e.g., 50 moves the element 50% of its height",
      },
      {
        name: "autoAlpha",
        type: "string",
        info: "autoAlpha is a GSAP shorthand that animates both opacity and visibility. For example, autoAlpha: 0 sets opacity to 0 and visibility to 'hidden', while autoAlpha: 1 sets opacity to 1 and visibility to 'visible'.",
      },
      {
        name: "yoyo",
        type: "boolean",
        default: "true",
        info: "Yoyo reverses the animation on each repeat, e.g., true makes the animation play forwards and then backwards",
      },
      {
        name: "overwrite",
        type: "boolean",
        default: "true",
        info: "Determines whether this animation should cancel and replace existing tweens of the same targets and properties. Useful for preventing animation conflicts.",
      },
      {
        name: "stagger",
        type: "number",
        info: "Delays the start time of each element in the animation sequence by a set amount, creating a staggered effect.",
      },
      {
        name: "custom",
        type: "custom",
        info: "Custom allows creating unique animations, e.g., x: 2, y: 2 creates a custom animation with specific properties",
      },
    ],
  },
  {
    name: "Draw SVG",
    items: [
      {
        name: "drawSVG",
        type: "string",
        info: "Defines the stroke animation range and duration for SVG paths. Accepts values like '0% 100%' to animate from start to end. Can be combined with duration (e.g., 2) to control how long the stroke animation takes in seconds.",
      },
      {
        name: "stroke",
        type: "string",
        info: "Defines the color of the SVG path's outline. Accepts color names, hex codes, RGB/RGBA, HSL/HSLA (e.g., '#ff0000', 'rgba(0,0,0,0.5)'.",
      },

      {
        name: "strokeWidth",
        type: "number",
        info: "Specifies the thickness of the SVG path's outline. The value is typically in pixels (e.g., 2 means a 2px wide stroke).",
      },
      {
        name: "fill",
        type: "string",
        info: "Defines the interior color of an SVG shape. Accepts color names, hex codes, RGB/RGBA, HSL/HSLA (e.g., '#ff0000', 'rgba(0,0,0,0.5)'.",
      },
    ],
  },
];

export const SProperties = [
  {
    name: "",
    items: [
      {
        name: "markers",
        type: "boolean",
        default: "false",
        info: "Markers shows start and end points of scroll animations, e.g., true displays visual markers for debugging",
      },
      {
        name: "anticipate pin",
        type: "number",
        info: "Anticipate Pin preps the pinned element for smoother transitions, e.g., 1 helps avoid layout shifts when pinning",
      },
      {
        name: "pin type",
        type: "pinType",
        default: "transform",
        info: "PinType defines the pinning method, e.g., 'transform' pins the element using CSS transform for smoother effects",
      },
      {
        name: "pinned container",
        type: "string",
        info: "Pinned container defines the container to be pinned, e.g., '.container' pins the entire container during scrolling",
      },
      {
        name: "custom",
        type: "custom",
        info: "Custom allows creating custom properties, e.g., x: 2, y: 2",
      },
    ],
  },
];
