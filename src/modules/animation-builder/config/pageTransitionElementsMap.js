const pageTransitionElementsMappings = {
  enter: [
    {
      groupName: "Enter",
      options: [
        {
          title: "Title",
          fieldType: "text-field",
          path: "title",
          placeholder: "Animation Title",
        },
        {
          title: "Absoulute Time",
          fieldType: "number-field",
          path: "absolute_time",
          placeholder: "3",
        },
        {
          title: "Method",
          fieldType: "tween-field",
          path: "method",
        },
      ],
    },
  ],
  exit: [
    {
      groupName: "Exit",
      options: [
        {
          title: "Title",
          fieldType: "text-field",
          path: "title",
          placeholder: "Animation Title",
        },
        {
          title: "Absoulute Time",
          fieldType: "number-field",
          path: "absolute_time",
          placeholder: "3",
        },
        {
          title: "Method",
          fieldType: "tween-field",
          path: "method",
        },
      ],
    },
  ],
};

export default pageTransitionElementsMappings;
