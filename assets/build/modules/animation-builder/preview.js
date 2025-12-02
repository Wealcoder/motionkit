/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@radix-ui/number/dist/index.mjs":
/*!******************************************************!*\
  !*** ./node_modules/@radix-ui/number/dist/index.mjs ***!
  \******************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clamp: function() { return /* binding */ clamp; }
/* harmony export */ });
// packages/core/number/src/number.ts
function clamp(value, [min, max]) {
  return Math.min(max, Math.max(min, value));
}

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/primitive/dist/index.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/@radix-ui/primitive/dist/index.mjs ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeEventHandlers: function() { return /* binding */ composeEventHandlers; }
/* harmony export */ });
// packages/core/primitive/src/primitive.tsx
function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
  return function handleEvent(event) {
    originalEventHandler?.(event);
    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-accordion/dist/index.mjs":
/*!***************************************************************!*\
  !*** ./node_modules/@radix-ui/react-accordion/dist/index.mjs ***!
  \***************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Accordion: function() { return /* binding */ Accordion; },
/* harmony export */   AccordionContent: function() { return /* binding */ AccordionContent; },
/* harmony export */   AccordionHeader: function() { return /* binding */ AccordionHeader; },
/* harmony export */   AccordionItem: function() { return /* binding */ AccordionItem; },
/* harmony export */   AccordionTrigger: function() { return /* binding */ AccordionTrigger; },
/* harmony export */   Content: function() { return /* binding */ Content2; },
/* harmony export */   Header: function() { return /* binding */ Header; },
/* harmony export */   Item: function() { return /* binding */ Item; },
/* harmony export */   Root: function() { return /* binding */ Root2; },
/* harmony export */   Trigger: function() { return /* binding */ Trigger2; },
/* harmony export */   createAccordionScope: function() { return /* binding */ createAccordionScope; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _radix_ui_react_context__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @radix-ui/react-context */ "./node_modules/@radix-ui/react-context/dist/index.mjs");
/* harmony import */ var _radix_ui_react_collection__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @radix-ui/react-collection */ "./node_modules/@radix-ui/react-collection/dist/index.mjs");
/* harmony import */ var _radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @radix-ui/react-compose-refs */ "./node_modules/@radix-ui/react-compose-refs/dist/index.mjs");
/* harmony import */ var _radix_ui_primitive__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @radix-ui/primitive */ "./node_modules/@radix-ui/primitive/dist/index.mjs");
/* harmony import */ var _radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @radix-ui/react-use-controllable-state */ "./node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs");
/* harmony import */ var _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @radix-ui/react-primitive */ "./node_modules/@radix-ui/react-primitive/dist/index.mjs");
/* harmony import */ var _radix_ui_react_collapsible__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @radix-ui/react-collapsible */ "./node_modules/@radix-ui/react-collapsible/dist/index.mjs");
/* harmony import */ var _radix_ui_react_id__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @radix-ui/react-id */ "./node_modules/@radix-ui/react-id/dist/index.mjs");
/* harmony import */ var _radix_ui_react_direction__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @radix-ui/react-direction */ "./node_modules/@radix-ui/react-direction/dist/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
"use client";

// packages/react/accordion/src/accordion.tsx












var ACCORDION_NAME = "Accordion";
var ACCORDION_KEYS = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
var [Collection, useCollection, createCollectionScope] = (0,_radix_ui_react_collection__WEBPACK_IMPORTED_MODULE_2__.createCollection)(ACCORDION_NAME);
var [createAccordionContext, createAccordionScope] = (0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_3__.createContextScope)(ACCORDION_NAME, [
  createCollectionScope,
  _radix_ui_react_collapsible__WEBPACK_IMPORTED_MODULE_4__.createCollapsibleScope
]);
var useCollapsibleScope = (0,_radix_ui_react_collapsible__WEBPACK_IMPORTED_MODULE_4__.createCollapsibleScope)();
var Accordion = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { type, ...accordionProps } = props;
    const singleProps = accordionProps;
    const multipleProps = accordionProps;
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(Collection.Provider, { scope: props.__scopeAccordion, children: type === "multiple" ? /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(AccordionImplMultiple, { ...multipleProps, ref: forwardedRef }) : /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(AccordionImplSingle, { ...singleProps, ref: forwardedRef }) });
  }
);
Accordion.displayName = ACCORDION_NAME;
var [AccordionValueProvider, useAccordionValueContext] = createAccordionContext(ACCORDION_NAME);
var [AccordionCollapsibleProvider, useAccordionCollapsibleContext] = createAccordionContext(
  ACCORDION_NAME,
  { collapsible: false }
);
var AccordionImplSingle = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const {
      value: valueProp,
      defaultValue,
      onValueChange = () => {
      },
      collapsible = false,
      ...accordionSingleProps
    } = props;
    const [value, setValue] = (0,_radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_5__.useControllableState)({
      prop: valueProp,
      defaultProp: defaultValue,
      onChange: onValueChange
    });
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      AccordionValueProvider,
      {
        scope: props.__scopeAccordion,
        value: value ? [value] : [],
        onItemOpen: setValue,
        onItemClose: react__WEBPACK_IMPORTED_MODULE_0__.useCallback(() => collapsible && setValue(""), [collapsible, setValue]),
        children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible, children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(AccordionImpl, { ...accordionSingleProps, ref: forwardedRef }) })
      }
    );
  }
);
var AccordionImplMultiple = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...accordionMultipleProps
  } = props;
  const [value = [], setValue] = (0,_radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_5__.useControllableState)({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange
  });
  const handleItemOpen = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(
    (itemValue) => setValue((prevValue = []) => [...prevValue, itemValue]),
    [setValue]
  );
  const handleItemClose = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(
    (itemValue) => setValue((prevValue = []) => prevValue.filter((value2) => value2 !== itemValue)),
    [setValue]
  );
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
    AccordionValueProvider,
    {
      scope: props.__scopeAccordion,
      value,
      onItemOpen: handleItemOpen,
      onItemClose: handleItemClose,
      children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible: true, children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(AccordionImpl, { ...accordionMultipleProps, ref: forwardedRef }) })
    }
  );
});
var [AccordionImplProvider, useAccordionContext] = createAccordionContext(ACCORDION_NAME);
var AccordionImpl = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, disabled, dir, orientation = "vertical", ...accordionProps } = props;
    const accordionRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
    const composedRefs = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_6__.useComposedRefs)(accordionRef, forwardedRef);
    const getItems = useCollection(__scopeAccordion);
    const direction = (0,_radix_ui_react_direction__WEBPACK_IMPORTED_MODULE_7__.useDirection)(dir);
    const isDirectionLTR = direction === "ltr";
    const handleKeyDown = (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_8__.composeEventHandlers)(props.onKeyDown, (event) => {
      if (!ACCORDION_KEYS.includes(event.key)) return;
      const target = event.target;
      const triggerCollection = getItems().filter((item) => !item.ref.current?.disabled);
      const triggerIndex = triggerCollection.findIndex((item) => item.ref.current === target);
      const triggerCount = triggerCollection.length;
      if (triggerIndex === -1) return;
      event.preventDefault();
      let nextIndex = triggerIndex;
      const homeIndex = 0;
      const endIndex = triggerCount - 1;
      const moveNext = () => {
        nextIndex = triggerIndex + 1;
        if (nextIndex > endIndex) {
          nextIndex = homeIndex;
        }
      };
      const movePrev = () => {
        nextIndex = triggerIndex - 1;
        if (nextIndex < homeIndex) {
          nextIndex = endIndex;
        }
      };
      switch (event.key) {
        case "Home":
          nextIndex = homeIndex;
          break;
        case "End":
          nextIndex = endIndex;
          break;
        case "ArrowRight":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              moveNext();
            } else {
              movePrev();
            }
          }
          break;
        case "ArrowDown":
          if (orientation === "vertical") {
            moveNext();
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              movePrev();
            } else {
              moveNext();
            }
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical") {
            movePrev();
          }
          break;
      }
      const clampedIndex = nextIndex % triggerCount;
      triggerCollection[clampedIndex].ref.current?.focus();
    });
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      AccordionImplProvider,
      {
        scope: __scopeAccordion,
        disabled,
        direction: dir,
        orientation,
        children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(Collection.Slot, { scope: __scopeAccordion, children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
          _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_9__.Primitive.div,
          {
            ...accordionProps,
            "data-orientation": orientation,
            ref: composedRefs,
            onKeyDown: disabled ? void 0 : handleKeyDown
          }
        ) })
      }
    );
  }
);
var ITEM_NAME = "AccordionItem";
var [AccordionItemProvider, useAccordionItemContext] = createAccordionContext(ITEM_NAME);
var AccordionItem = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, value, ...accordionItemProps } = props;
    const accordionContext = useAccordionContext(ITEM_NAME, __scopeAccordion);
    const valueContext = useAccordionValueContext(ITEM_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    const triggerId = (0,_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_10__.useId)();
    const open = value && valueContext.value.includes(value) || false;
    const disabled = accordionContext.disabled || props.disabled;
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      AccordionItemProvider,
      {
        scope: __scopeAccordion,
        open,
        disabled,
        triggerId,
        children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
          _radix_ui_react_collapsible__WEBPACK_IMPORTED_MODULE_4__.Root,
          {
            "data-orientation": accordionContext.orientation,
            "data-state": getState(open),
            ...collapsibleScope,
            ...accordionItemProps,
            ref: forwardedRef,
            disabled,
            open,
            onOpenChange: (open2) => {
              if (open2) {
                valueContext.onItemOpen(value);
              } else {
                valueContext.onItemClose(value);
              }
            }
          }
        )
      }
    );
  }
);
AccordionItem.displayName = ITEM_NAME;
var HEADER_NAME = "AccordionHeader";
var AccordionHeader = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...headerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(HEADER_NAME, __scopeAccordion);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_9__.Primitive.h3,
      {
        "data-orientation": accordionContext.orientation,
        "data-state": getState(itemContext.open),
        "data-disabled": itemContext.disabled ? "" : void 0,
        ...headerProps,
        ref: forwardedRef
      }
    );
  }
);
AccordionHeader.displayName = HEADER_NAME;
var TRIGGER_NAME = "AccordionTrigger";
var AccordionTrigger = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...triggerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleContext = useAccordionCollapsibleContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(Collection.ItemSlot, { scope: __scopeAccordion, children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      _radix_ui_react_collapsible__WEBPACK_IMPORTED_MODULE_4__.Trigger,
      {
        "aria-disabled": itemContext.open && !collapsibleContext.collapsible || void 0,
        "data-orientation": accordionContext.orientation,
        id: itemContext.triggerId,
        ...collapsibleScope,
        ...triggerProps,
        ref: forwardedRef
      }
    ) });
  }
);
AccordionTrigger.displayName = TRIGGER_NAME;
var CONTENT_NAME = "AccordionContent";
var AccordionContent = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...contentProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(CONTENT_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      _radix_ui_react_collapsible__WEBPACK_IMPORTED_MODULE_4__.Content,
      {
        role: "region",
        "aria-labelledby": itemContext.triggerId,
        "data-orientation": accordionContext.orientation,
        ...collapsibleScope,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ["--radix-accordion-content-height"]: "var(--radix-collapsible-content-height)",
          ["--radix-accordion-content-width"]: "var(--radix-collapsible-content-width)",
          ...props.style
        }
      }
    );
  }
);
AccordionContent.displayName = CONTENT_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var Root2 = Accordion;
var Item = AccordionItem;
var Header = AccordionHeader;
var Trigger2 = AccordionTrigger;
var Content2 = AccordionContent;

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-collapsible/dist/index.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/@radix-ui/react-collapsible/dist/index.mjs ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Collapsible: function() { return /* binding */ Collapsible; },
/* harmony export */   CollapsibleContent: function() { return /* binding */ CollapsibleContent; },
/* harmony export */   CollapsibleTrigger: function() { return /* binding */ CollapsibleTrigger; },
/* harmony export */   Content: function() { return /* binding */ Content; },
/* harmony export */   Root: function() { return /* binding */ Root; },
/* harmony export */   Trigger: function() { return /* binding */ Trigger; },
/* harmony export */   createCollapsibleScope: function() { return /* binding */ createCollapsibleScope; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _radix_ui_primitive__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @radix-ui/primitive */ "./node_modules/@radix-ui/primitive/dist/index.mjs");
/* harmony import */ var _radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @radix-ui/react-context */ "./node_modules/@radix-ui/react-context/dist/index.mjs");
/* harmony import */ var _radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @radix-ui/react-use-controllable-state */ "./node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs");
/* harmony import */ var _radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @radix-ui/react-use-layout-effect */ "./node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs");
/* harmony import */ var _radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @radix-ui/react-compose-refs */ "./node_modules/@radix-ui/react-compose-refs/dist/index.mjs");
/* harmony import */ var _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @radix-ui/react-primitive */ "./node_modules/@radix-ui/react-primitive/dist/index.mjs");
/* harmony import */ var _radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @radix-ui/react-presence */ "./node_modules/@radix-ui/react-presence/dist/index.mjs");
/* harmony import */ var _radix_ui_react_id__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @radix-ui/react-id */ "./node_modules/@radix-ui/react-id/dist/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
"use client";

// packages/react/collapsible/src/collapsible.tsx










var COLLAPSIBLE_NAME = "Collapsible";
var [createCollapsibleContext, createCollapsibleScope] = (0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__.createContextScope)(COLLAPSIBLE_NAME);
var [CollapsibleProvider, useCollapsibleContext] = createCollapsibleContext(COLLAPSIBLE_NAME);
var Collapsible = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCollapsible,
      open: openProp,
      defaultOpen,
      disabled,
      onOpenChange,
      ...collapsibleProps
    } = props;
    const [open = false, setOpen] = (0,_radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_3__.useControllableState)({
      prop: openProp,
      defaultProp: defaultOpen,
      onChange: onOpenChange
    });
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      CollapsibleProvider,
      {
        scope: __scopeCollapsible,
        disabled,
        contentId: (0,_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_4__.useId)(),
        open,
        onOpenToggle: react__WEBPACK_IMPORTED_MODULE_0__.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
          _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_5__.Primitive.div,
          {
            "data-state": getState(open),
            "data-disabled": disabled ? "" : void 0,
            ...collapsibleProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Collapsible.displayName = COLLAPSIBLE_NAME;
var TRIGGER_NAME = "CollapsibleTrigger";
var CollapsibleTrigger = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCollapsible, ...triggerProps } = props;
    const context = useCollapsibleContext(TRIGGER_NAME, __scopeCollapsible);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_5__.Primitive.button,
      {
        type: "button",
        "aria-controls": context.contentId,
        "aria-expanded": context.open || false,
        "data-state": getState(context.open),
        "data-disabled": context.disabled ? "" : void 0,
        disabled: context.disabled,
        ...triggerProps,
        ref: forwardedRef,
        onClick: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_6__.composeEventHandlers)(props.onClick, context.onOpenToggle)
      }
    );
  }
);
CollapsibleTrigger.displayName = TRIGGER_NAME;
var CONTENT_NAME = "CollapsibleContent";
var CollapsibleContent = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...contentProps } = props;
    const context = useCollapsibleContext(CONTENT_NAME, props.__scopeCollapsible);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_7__.Presence, { present: forceMount || context.open, children: ({ present }) => /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(CollapsibleContentImpl, { ...contentProps, ref: forwardedRef, present }) });
  }
);
CollapsibleContent.displayName = CONTENT_NAME;
var CollapsibleContentImpl = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const { __scopeCollapsible, present, children, ...contentProps } = props;
  const context = useCollapsibleContext(CONTENT_NAME, __scopeCollapsible);
  const [isPresent, setIsPresent] = react__WEBPACK_IMPORTED_MODULE_0__.useState(present);
  const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const composedRefs = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_8__.useComposedRefs)(forwardedRef, ref);
  const heightRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(0);
  const height = heightRef.current;
  const widthRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(0);
  const width = widthRef.current;
  const isOpen = context.open || isPresent;
  const isMountAnimationPreventedRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(isOpen);
  const originalStylesRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(void 0);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
    return () => cancelAnimationFrame(rAF);
  }, []);
  (0,_radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_9__.useLayoutEffect)(() => {
    const node = ref.current;
    if (node) {
      originalStylesRef.current = originalStylesRef.current || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName
      };
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";
      const rect = node.getBoundingClientRect();
      heightRef.current = rect.height;
      widthRef.current = rect.width;
      if (!isMountAnimationPreventedRef.current) {
        node.style.transitionDuration = originalStylesRef.current.transitionDuration;
        node.style.animationName = originalStylesRef.current.animationName;
      }
      setIsPresent(present);
    }
  }, [context.open, present]);
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
    _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_5__.Primitive.div,
    {
      "data-state": getState(context.open),
      "data-disabled": context.disabled ? "" : void 0,
      id: context.contentId,
      hidden: !isOpen,
      ...contentProps,
      ref: composedRefs,
      style: {
        [`--radix-collapsible-content-height`]: height ? `${height}px` : void 0,
        [`--radix-collapsible-content-width`]: width ? `${width}px` : void 0,
        ...props.style
      },
      children: isOpen && children
    }
  );
});
function getState(open) {
  return open ? "open" : "closed";
}
var Root = Collapsible;
var Trigger = CollapsibleTrigger;
var Content = CollapsibleContent;

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-collection/dist/index.mjs":
/*!****************************************************************!*\
  !*** ./node_modules/@radix-ui/react-collection/dist/index.mjs ***!
  \****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createCollection: function() { return /* binding */ createCollection; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @radix-ui/react-context */ "./node_modules/@radix-ui/react-context/dist/index.mjs");
/* harmony import */ var _radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @radix-ui/react-compose-refs */ "./node_modules/@radix-ui/react-compose-refs/dist/index.mjs");
/* harmony import */ var _radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @radix-ui/react-slot */ "./node_modules/@radix-ui/react-slot/dist/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
"use client";

// packages/react/collection/src/collection.tsx





function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope] = (0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__.createContextScope)(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  );
  const CollectionProvider = (props) => {
    const { scope, children } = props;
    const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
    const itemMap = react__WEBPACK_IMPORTED_MODULE_0__.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
  };
  CollectionProvider.displayName = PROVIDER_NAME;
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlotImpl = (0,_radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__.createSlot)(COLLECTION_SLOT_NAME);
  const CollectionSlot = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_4__.useComposedRefs)(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(CollectionSlotImpl, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlotImpl = (0,_radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__.createSlot)(ITEM_SLOT_NAME);
  const CollectionItemSlot = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
      const composedRefs = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_4__.useComposedRefs)(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useCollection(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current)
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection,
    createCollectionScope
  ];
}

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-compose-refs/dist/index.mjs":
/*!******************************************************************!*\
  !*** ./node_modules/@radix-ui/react-compose-refs/dist/index.mjs ***!
  \******************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   composeRefs: function() { return /* binding */ composeRefs; },
/* harmony export */   useComposedRefs: function() { return /* binding */ useComposedRefs; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
// packages/react/compose-refs/src/compose-refs.tsx

function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}
function useComposedRefs(...refs) {
  return react__WEBPACK_IMPORTED_MODULE_0__.useCallback(composeRefs(...refs), refs);
}

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-context/dist/index.mjs":
/*!*************************************************************!*\
  !*** ./node_modules/@radix-ui/react-context/dist/index.mjs ***!
  \*************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createContext: function() { return /* binding */ createContext2; },
/* harmony export */   createContextScope: function() { return /* binding */ createContextScope; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
// packages/react/context/src/create-context.tsx


function createContext2(rootComponentName, defaultContext) {
  const Context = react__WEBPACK_IMPORTED_MODULE_0__.createContext(defaultContext);
  const Provider = (props) => {
    const { children, ...context } = props;
    const value = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => context, Object.values(context));
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(Context.Provider, { value, children });
  };
  Provider.displayName = rootComponentName + "Provider";
  function useContext2(consumerName) {
    const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(Context);
    if (context) return context;
    if (defaultContext !== void 0) return defaultContext;
    throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
  }
  return [Provider, useContext2];
}
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = react__WEBPACK_IMPORTED_MODULE_0__.createContext(defaultContext);
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider = (props) => {
      const { scope, children, ...context } = props;
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const value = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(Context.Provider, { value, children });
    };
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope) {
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const context = react__WEBPACK_IMPORTED_MODULE_0__.useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext2];
  }
  const createScope = () => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return react__WEBPACK_IMPORTED_MODULE_0__.createContext(defaultContext);
    });
    return function useScope(scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    };
  };
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = () => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    };
  };
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-direction/dist/index.mjs":
/*!***************************************************************!*\
  !*** ./node_modules/@radix-ui/react-direction/dist/index.mjs ***!
  \***************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DirectionProvider: function() { return /* binding */ DirectionProvider; },
/* harmony export */   Provider: function() { return /* binding */ Provider; },
/* harmony export */   useDirection: function() { return /* binding */ useDirection; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
// packages/react/direction/src/direction.tsx


var DirectionContext = react__WEBPACK_IMPORTED_MODULE_0__.createContext(void 0);
var DirectionProvider = (props) => {
  const { dir, children } = props;
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DirectionContext.Provider, { value: dir, children });
};
function useDirection(localDir) {
  const globalDir = react__WEBPACK_IMPORTED_MODULE_0__.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}
var Provider = DirectionProvider;

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-id/dist/index.mjs":
/*!********************************************************!*\
  !*** ./node_modules/@radix-ui/react-id/dist/index.mjs ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

var react__WEBPACK_IMPORTED_MODULE_0___namespace_cache;
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useId: function() { return /* binding */ useId; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @radix-ui/react-use-layout-effect */ "./node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs");
// packages/react/id/src/id.tsx


var useReactId = /*#__PURE__*/ (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache || (react__WEBPACK_IMPORTED_MODULE_0___namespace_cache = __webpack_require__.t(react__WEBPACK_IMPORTED_MODULE_0__, 2)))[" useId ".trim().toString()] || (() => void 0);
var count = 0;
function useId(deterministicId) {
  const [id, setId] = react__WEBPACK_IMPORTED_MODULE_0__.useState(useReactId());
  (0,_radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_1__.useLayoutEffect)(() => {
    if (!deterministicId) setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);
  return deterministicId || (id ? `radix-${id}` : "");
}

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-presence/dist/index.mjs":
/*!**************************************************************!*\
  !*** ./node_modules/@radix-ui/react-presence/dist/index.mjs ***!
  \**************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Presence: function() { return /* binding */ Presence; },
/* harmony export */   Root: function() { return /* binding */ Root; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @radix-ui/react-compose-refs */ "./node_modules/@radix-ui/react-compose-refs/dist/index.mjs");
/* harmony import */ var _radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @radix-ui/react-use-layout-effect */ "./node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs");
"use client";

// packages/react/presence/src/presence.tsx




// packages/react/presence/src/use-state-machine.tsx

function useStateMachine(initialState, machine) {
  return react__WEBPACK_IMPORTED_MODULE_0__.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}

// packages/react/presence/src/presence.tsx
var Presence = (props) => {
  const { present, children } = props;
  const presence = usePresence(present);
  const child = typeof children === "function" ? children({ present: presence.isPresent }) : react__WEBPACK_IMPORTED_MODULE_0__.Children.only(children);
  const ref = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_1__.useComposedRefs)(presence.ref, getElementRef(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(child, { ref }) : null;
};
Presence.displayName = "Presence";
function usePresence(present) {
  const [node, setNode] = react__WEBPACK_IMPORTED_MODULE_0__.useState();
  const stylesRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef({});
  const prevPresentRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(present);
  const prevAnimationNameRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    const currentAnimationName = getAnimationName(stylesRef.current);
    prevAnimationNameRef.current = state === "mounted" ? currentAnimationName : "none";
  }, [state]);
  (0,_radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_2__.useLayoutEffect)(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);
      if (present) {
        send("MOUNT");
      } else if (currentAnimationName === "none" || styles?.display === "none") {
        send("UNMOUNT");
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) {
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }
      }
      prevPresentRef.current = present;
    }
  }, [present, send]);
  (0,_radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_2__.useLayoutEffect)(() => {
    if (node) {
      let timeoutId;
      const ownerWindow = node.ownerDocument.defaultView ?? window;
      const handleAnimationEnd = (event) => {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(event.animationName);
        if (event.target === node && isCurrentAnimation) {
          send("ANIMATION_END");
          if (!prevPresentRef.current) {
            const currentFillMode = node.style.animationFillMode;
            node.style.animationFillMode = "forwards";
            timeoutId = ownerWindow.setTimeout(() => {
              if (node.style.animationFillMode === "forwards") {
                node.style.animationFillMode = currentFillMode;
              }
            });
          }
        }
      };
      const handleAnimationStart = (event) => {
        if (event.target === node) {
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      };
      node.addEventListener("animationstart", handleAnimationStart);
      node.addEventListener("animationcancel", handleAnimationEnd);
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        ownerWindow.clearTimeout(timeoutId);
        node.removeEventListener("animationstart", handleAnimationStart);
        node.removeEventListener("animationcancel", handleAnimationEnd);
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    } else {
      send("ANIMATION_END");
    }
  }, [node, send]);
  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: react__WEBPACK_IMPORTED_MODULE_0__.useCallback((node2) => {
      if (node2) stylesRef.current = getComputedStyle(node2);
      setNode(node2);
    }, [])
  };
}
function getAnimationName(styles) {
  return styles?.animationName || "none";
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
var Root = Presence;

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-primitive/dist/index.mjs":
/*!***************************************************************!*\
  !*** ./node_modules/@radix-ui/react-primitive/dist/index.mjs ***!
  \***************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Primitive: function() { return /* binding */ Primitive; },
/* harmony export */   Root: function() { return /* binding */ Root; },
/* harmony export */   dispatchDiscreteCustomEvent: function() { return /* binding */ dispatchDiscreteCustomEvent; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var _radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @radix-ui/react-slot */ "./node_modules/@radix-ui/react-slot/dist/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
// packages/react/primitive/src/primitive.tsx




var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot = (0,_radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__.createSlot)(`Primitive.${node}`);
  const Node = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});
function dispatchDiscreteCustomEvent(target, event) {
  if (target) react_dom__WEBPACK_IMPORTED_MODULE_1__.flushSync(() => target.dispatchEvent(event));
}
var Root = Primitive;

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-roving-focus/dist/index.mjs":
/*!******************************************************************!*\
  !*** ./node_modules/@radix-ui/react-roving-focus/dist/index.mjs ***!
  \******************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Item: function() { return /* binding */ Item; },
/* harmony export */   Root: function() { return /* binding */ Root; },
/* harmony export */   RovingFocusGroup: function() { return /* binding */ RovingFocusGroup; },
/* harmony export */   RovingFocusGroupItem: function() { return /* binding */ RovingFocusGroupItem; },
/* harmony export */   createRovingFocusGroupScope: function() { return /* binding */ createRovingFocusGroupScope; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _radix_ui_primitive__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @radix-ui/primitive */ "./node_modules/@radix-ui/primitive/dist/index.mjs");
/* harmony import */ var _radix_ui_react_collection__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @radix-ui/react-collection */ "./node_modules/@radix-ui/react-collection/dist/index.mjs");
/* harmony import */ var _radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @radix-ui/react-compose-refs */ "./node_modules/@radix-ui/react-compose-refs/dist/index.mjs");
/* harmony import */ var _radix_ui_react_context__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @radix-ui/react-context */ "./node_modules/@radix-ui/react-context/dist/index.mjs");
/* harmony import */ var _radix_ui_react_id__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @radix-ui/react-id */ "./node_modules/@radix-ui/react-id/dist/index.mjs");
/* harmony import */ var _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @radix-ui/react-primitive */ "./node_modules/@radix-ui/react-primitive/dist/index.mjs");
/* harmony import */ var _radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @radix-ui/react-use-callback-ref */ "./node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs");
/* harmony import */ var _radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @radix-ui/react-use-controllable-state */ "./node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs");
/* harmony import */ var _radix_ui_react_direction__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @radix-ui/react-direction */ "./node_modules/@radix-ui/react-direction/dist/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
"use client";

// packages/react/roving-focus/src/roving-focus-group.tsx











var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var GROUP_NAME = "RovingFocusGroup";
var [Collection, useCollection, createCollectionScope] = (0,_radix_ui_react_collection__WEBPACK_IMPORTED_MODULE_2__.createCollection)(GROUP_NAME);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = (0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_3__.createContextScope)(
  GROUP_NAME,
  [createCollectionScope]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME);
var RovingFocusGroup = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(Collection.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(Collection.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME;
var RovingFocusGroupImpl = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const composedRefs = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_4__.useComposedRefs)(forwardedRef, ref);
  const direction = (0,_radix_ui_react_direction__WEBPACK_IMPORTED_MODULE_5__.useDirection)(dir);
  const [currentTabStopId = null, setCurrentTabStopId] = (0,_radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_6__.useControllableState)({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId,
    onChange: onCurrentTabStopIdChange
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = react__WEBPACK_IMPORTED_MODULE_0__.useState(false);
  const handleEntryFocus = (0,_radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_7__.useCallbackRef)(onEntryFocus);
  const getItems = useCollection(__scopeRovingFocusGroup);
  const isClickFocusRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = react__WEBPACK_IMPORTED_MODULE_0__.useState(0);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: react__WEBPACK_IMPORTED_MODULE_0__.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: react__WEBPACK_IMPORTED_MODULE_0__.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: react__WEBPACK_IMPORTED_MODULE_0__.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: react__WEBPACK_IMPORTED_MODULE_0__.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
        _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_8__.Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_9__.composeEventHandlers)(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_9__.composeEventHandlers)(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_9__.composeEventHandlers)(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME = "RovingFocusGroupItem";
var RovingFocusGroupItem = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      ...itemProps
    } = props;
    const autoId = (0,_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_10__.useId)();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove } = context;
    react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      Collection.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
          _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_8__.Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_9__.composeEventHandlers)(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_9__.composeEventHandlers)(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_9__.composeEventHandlers)(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst(candidateNodes));
              }
            })
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
function focusFirst(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
var Root = RovingFocusGroup;
var Item = RovingFocusGroupItem;

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-scroll-area/dist/index.mjs":
/*!*****************************************************************!*\
  !*** ./node_modules/@radix-ui/react-scroll-area/dist/index.mjs ***!
  \*****************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Corner: function() { return /* binding */ Corner; },
/* harmony export */   Root: function() { return /* binding */ Root; },
/* harmony export */   ScrollArea: function() { return /* binding */ ScrollArea; },
/* harmony export */   ScrollAreaCorner: function() { return /* binding */ ScrollAreaCorner; },
/* harmony export */   ScrollAreaScrollbar: function() { return /* binding */ ScrollAreaScrollbar; },
/* harmony export */   ScrollAreaThumb: function() { return /* binding */ ScrollAreaThumb; },
/* harmony export */   ScrollAreaViewport: function() { return /* binding */ ScrollAreaViewport; },
/* harmony export */   Scrollbar: function() { return /* binding */ Scrollbar; },
/* harmony export */   Thumb: function() { return /* binding */ Thumb; },
/* harmony export */   Viewport: function() { return /* binding */ Viewport; },
/* harmony export */   createScrollAreaScope: function() { return /* binding */ createScrollAreaScope; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @radix-ui/react-primitive */ "./node_modules/@radix-ui/react-primitive/dist/index.mjs");
/* harmony import */ var _radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @radix-ui/react-presence */ "./node_modules/@radix-ui/react-presence/dist/index.mjs");
/* harmony import */ var _radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @radix-ui/react-context */ "./node_modules/@radix-ui/react-context/dist/index.mjs");
/* harmony import */ var _radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @radix-ui/react-compose-refs */ "./node_modules/@radix-ui/react-compose-refs/dist/index.mjs");
/* harmony import */ var _radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @radix-ui/react-use-callback-ref */ "./node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs");
/* harmony import */ var _radix_ui_react_direction__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @radix-ui/react-direction */ "./node_modules/@radix-ui/react-direction/dist/index.mjs");
/* harmony import */ var _radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @radix-ui/react-use-layout-effect */ "./node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs");
/* harmony import */ var _radix_ui_number__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @radix-ui/number */ "./node_modules/@radix-ui/number/dist/index.mjs");
/* harmony import */ var _radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @radix-ui/primitive */ "./node_modules/@radix-ui/primitive/dist/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
"use client";

// packages/react/scroll-area/src/scroll-area.tsx











// packages/react/scroll-area/src/use-state-machine.ts

function useStateMachine(initialState, machine) {
  return react__WEBPACK_IMPORTED_MODULE_0__.useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}

// packages/react/scroll-area/src/scroll-area.tsx

var SCROLL_AREA_NAME = "ScrollArea";
var [createScrollAreaContext, createScrollAreaScope] = (0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__.createContextScope)(SCROLL_AREA_NAME);
var [ScrollAreaProvider, useScrollAreaContext] = createScrollAreaContext(SCROLL_AREA_NAME);
var ScrollArea = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeScrollArea,
      type = "hover",
      dir,
      scrollHideDelay = 600,
      ...scrollAreaProps
    } = props;
    const [scrollArea, setScrollArea] = react__WEBPACK_IMPORTED_MODULE_0__.useState(null);
    const [viewport, setViewport] = react__WEBPACK_IMPORTED_MODULE_0__.useState(null);
    const [content, setContent] = react__WEBPACK_IMPORTED_MODULE_0__.useState(null);
    const [scrollbarX, setScrollbarX] = react__WEBPACK_IMPORTED_MODULE_0__.useState(null);
    const [scrollbarY, setScrollbarY] = react__WEBPACK_IMPORTED_MODULE_0__.useState(null);
    const [cornerWidth, setCornerWidth] = react__WEBPACK_IMPORTED_MODULE_0__.useState(0);
    const [cornerHeight, setCornerHeight] = react__WEBPACK_IMPORTED_MODULE_0__.useState(0);
    const [scrollbarXEnabled, setScrollbarXEnabled] = react__WEBPACK_IMPORTED_MODULE_0__.useState(false);
    const [scrollbarYEnabled, setScrollbarYEnabled] = react__WEBPACK_IMPORTED_MODULE_0__.useState(false);
    const composedRefs = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_3__.useComposedRefs)(forwardedRef, (node) => setScrollArea(node));
    const direction = (0,_radix_ui_react_direction__WEBPACK_IMPORTED_MODULE_4__.useDirection)(dir);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      ScrollAreaProvider,
      {
        scope: __scopeScrollArea,
        type,
        dir: direction,
        scrollHideDelay,
        scrollArea,
        viewport,
        onViewportChange: setViewport,
        content,
        onContentChange: setContent,
        scrollbarX,
        onScrollbarXChange: setScrollbarX,
        scrollbarXEnabled,
        onScrollbarXEnabledChange: setScrollbarXEnabled,
        scrollbarY,
        onScrollbarYChange: setScrollbarY,
        scrollbarYEnabled,
        onScrollbarYEnabledChange: setScrollbarYEnabled,
        onCornerWidthChange: setCornerWidth,
        onCornerHeightChange: setCornerHeight,
        children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
          _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_5__.Primitive.div,
          {
            dir: direction,
            ...scrollAreaProps,
            ref: composedRefs,
            style: {
              position: "relative",
              // Pass corner sizes as CSS vars to reduce re-renders of context consumers
              ["--radix-scroll-area-corner-width"]: cornerWidth + "px",
              ["--radix-scroll-area-corner-height"]: cornerHeight + "px",
              ...props.style
            }
          }
        )
      }
    );
  }
);
ScrollArea.displayName = SCROLL_AREA_NAME;
var VIEWPORT_NAME = "ScrollAreaViewport";
var ScrollAreaViewport = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, children, nonce, ...viewportProps } = props;
    const context = useScrollAreaContext(VIEWPORT_NAME, __scopeScrollArea);
    const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
    const composedRefs = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_3__.useComposedRefs)(forwardedRef, ref, context.onViewportChange);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment, { children: [
      /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
        "style",
        {
          dangerouslySetInnerHTML: {
            __html: `[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}`
          },
          nonce
        }
      ),
      /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
        _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_5__.Primitive.div,
        {
          "data-radix-scroll-area-viewport": "",
          ...viewportProps,
          ref: composedRefs,
          style: {
            /**
             * We don't support `visible` because the intention is to have at least one scrollbar
             * if this component is used and `visible` will behave like `auto` in that case
             * https://developer.mozilla.org/en-US/docs/Web/CSS/overflow#description
             *
             * We don't handle `auto` because the intention is for the native implementation
             * to be hidden if using this component. We just want to ensure the node is scrollable
             * so could have used either `scroll` or `auto` here. We picked `scroll` to prevent
             * the browser from having to work out whether to render native scrollbars or not,
             * we tell it to with the intention of hiding them in CSS.
             */
            overflowX: context.scrollbarXEnabled ? "scroll" : "hidden",
            overflowY: context.scrollbarYEnabled ? "scroll" : "hidden",
            ...props.style
          },
          children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div", { ref: context.onContentChange, style: { minWidth: "100%", display: "table" }, children })
        }
      )
    ] });
  }
);
ScrollAreaViewport.displayName = VIEWPORT_NAME;
var SCROLLBAR_NAME = "ScrollAreaScrollbar";
var ScrollAreaScrollbar = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...scrollbarProps } = props;
    const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
    const { onScrollbarXEnabledChange, onScrollbarYEnabledChange } = context;
    const isHorizontal = props.orientation === "horizontal";
    react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
      isHorizontal ? onScrollbarXEnabledChange(true) : onScrollbarYEnabledChange(true);
      return () => {
        isHorizontal ? onScrollbarXEnabledChange(false) : onScrollbarYEnabledChange(false);
      };
    }, [isHorizontal, onScrollbarXEnabledChange, onScrollbarYEnabledChange]);
    return context.type === "hover" ? /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(ScrollAreaScrollbarHover, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "scroll" ? /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(ScrollAreaScrollbarScroll, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "auto" ? /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(ScrollAreaScrollbarAuto, { ...scrollbarProps, ref: forwardedRef, forceMount }) : context.type === "always" ? /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(ScrollAreaScrollbarVisible, { ...scrollbarProps, ref: forwardedRef }) : null;
  }
);
ScrollAreaScrollbar.displayName = SCROLLBAR_NAME;
var ScrollAreaScrollbarHover = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [visible, setVisible] = react__WEBPACK_IMPORTED_MODULE_0__.useState(false);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    const scrollArea = context.scrollArea;
    let hideTimer = 0;
    if (scrollArea) {
      const handlePointerEnter = () => {
        window.clearTimeout(hideTimer);
        setVisible(true);
      };
      const handlePointerLeave = () => {
        hideTimer = window.setTimeout(() => setVisible(false), context.scrollHideDelay);
      };
      scrollArea.addEventListener("pointerenter", handlePointerEnter);
      scrollArea.addEventListener("pointerleave", handlePointerLeave);
      return () => {
        window.clearTimeout(hideTimer);
        scrollArea.removeEventListener("pointerenter", handlePointerEnter);
        scrollArea.removeEventListener("pointerleave", handlePointerLeave);
      };
    }
  }, [context.scrollArea, context.scrollHideDelay]);
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_6__.Presence, { present: forceMount || visible, children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
    ScrollAreaScrollbarAuto,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarScroll = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const { forceMount, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const isHorizontal = props.orientation === "horizontal";
  const debounceScrollEnd = useDebounceCallback(() => send("SCROLL_END"), 100);
  const [state, send] = useStateMachine("hidden", {
    hidden: {
      SCROLL: "scrolling"
    },
    scrolling: {
      SCROLL_END: "idle",
      POINTER_ENTER: "interacting"
    },
    interacting: {
      SCROLL: "interacting",
      POINTER_LEAVE: "idle"
    },
    idle: {
      HIDE: "hidden",
      SCROLL: "scrolling",
      POINTER_ENTER: "interacting"
    }
  });
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    if (state === "idle") {
      const hideTimer = window.setTimeout(() => send("HIDE"), context.scrollHideDelay);
      return () => window.clearTimeout(hideTimer);
    }
  }, [state, context.scrollHideDelay, send]);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    const viewport = context.viewport;
    const scrollDirection = isHorizontal ? "scrollLeft" : "scrollTop";
    if (viewport) {
      let prevScrollPos = viewport[scrollDirection];
      const handleScroll = () => {
        const scrollPos = viewport[scrollDirection];
        const hasScrollInDirectionChanged = prevScrollPos !== scrollPos;
        if (hasScrollInDirectionChanged) {
          send("SCROLL");
          debounceScrollEnd();
        }
        prevScrollPos = scrollPos;
      };
      viewport.addEventListener("scroll", handleScroll);
      return () => viewport.removeEventListener("scroll", handleScroll);
    }
  }, [context.viewport, isHorizontal, send, debounceScrollEnd]);
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_6__.Presence, { present: forceMount || state !== "hidden", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
    ScrollAreaScrollbarVisible,
    {
      "data-state": state === "hidden" ? "hidden" : "visible",
      ...scrollbarProps,
      ref: forwardedRef,
      onPointerEnter: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.composeEventHandlers)(props.onPointerEnter, () => send("POINTER_ENTER")),
      onPointerLeave: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.composeEventHandlers)(props.onPointerLeave, () => send("POINTER_LEAVE"))
    }
  ) });
});
var ScrollAreaScrollbarAuto = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const { forceMount, ...scrollbarProps } = props;
  const [visible, setVisible] = react__WEBPACK_IMPORTED_MODULE_0__.useState(false);
  const isHorizontal = props.orientation === "horizontal";
  const handleResize = useDebounceCallback(() => {
    if (context.viewport) {
      const isOverflowX = context.viewport.offsetWidth < context.viewport.scrollWidth;
      const isOverflowY = context.viewport.offsetHeight < context.viewport.scrollHeight;
      setVisible(isHorizontal ? isOverflowX : isOverflowY);
    }
  }, 10);
  useResizeObserver(context.viewport, handleResize);
  useResizeObserver(context.content, handleResize);
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_6__.Presence, { present: forceMount || visible, children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
    ScrollAreaScrollbarVisible,
    {
      "data-state": visible ? "visible" : "hidden",
      ...scrollbarProps,
      ref: forwardedRef
    }
  ) });
});
var ScrollAreaScrollbarVisible = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const { orientation = "vertical", ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const thumbRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const pointerOffsetRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(0);
  const [sizes, setSizes] = react__WEBPACK_IMPORTED_MODULE_0__.useState({
    content: 0,
    viewport: 0,
    scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 }
  });
  const thumbRatio = getThumbRatio(sizes.viewport, sizes.content);
  const commonProps = {
    ...scrollbarProps,
    sizes,
    onSizesChange: setSizes,
    hasThumb: Boolean(thumbRatio > 0 && thumbRatio < 1),
    onThumbChange: (thumb) => thumbRef.current = thumb,
    onThumbPointerUp: () => pointerOffsetRef.current = 0,
    onThumbPointerDown: (pointerPos) => pointerOffsetRef.current = pointerPos
  };
  function getScrollPosition(pointerPos, dir) {
    return getScrollPositionFromPointer(pointerPos, pointerOffsetRef.current, sizes, dir);
  }
  if (orientation === "horizontal") {
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      ScrollAreaScrollbarX,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: () => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollLeft;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes, context.dir);
            thumbRef.current.style.transform = `translate3d(${offset}px, 0, 0)`;
          }
        },
        onWheelScroll: (scrollPos) => {
          if (context.viewport) context.viewport.scrollLeft = scrollPos;
        },
        onDragScroll: (pointerPos) => {
          if (context.viewport) {
            context.viewport.scrollLeft = getScrollPosition(pointerPos, context.dir);
          }
        }
      }
    );
  }
  if (orientation === "vertical") {
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      ScrollAreaScrollbarY,
      {
        ...commonProps,
        ref: forwardedRef,
        onThumbPositionChange: () => {
          if (context.viewport && thumbRef.current) {
            const scrollPos = context.viewport.scrollTop;
            const offset = getThumbOffsetFromScroll(scrollPos, sizes);
            thumbRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
          }
        },
        onWheelScroll: (scrollPos) => {
          if (context.viewport) context.viewport.scrollTop = scrollPos;
        },
        onDragScroll: (pointerPos) => {
          if (context.viewport) context.viewport.scrollTop = getScrollPosition(pointerPos);
        }
      }
    );
  }
  return null;
});
var ScrollAreaScrollbarX = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = react__WEBPACK_IMPORTED_MODULE_0__.useState();
  const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const composeRefs = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_3__.useComposedRefs)(forwardedRef, ref, context.onScrollbarXChange);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "horizontal",
      ...scrollbarProps,
      ref: composeRefs,
      sizes,
      style: {
        bottom: 0,
        left: context.dir === "rtl" ? "var(--radix-scroll-area-corner-width)" : 0,
        right: context.dir === "ltr" ? "var(--radix-scroll-area-corner-width)" : 0,
        ["--radix-scroll-area-thumb-width"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.x),
      onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.x),
      onWheelScroll: (event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollLeft + event.deltaX;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      },
      onResize: () => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollWidth,
            viewport: context.viewport.offsetWidth,
            scrollbar: {
              size: ref.current.clientWidth,
              paddingStart: toInt(computedStyle.paddingLeft),
              paddingEnd: toInt(computedStyle.paddingRight)
            }
          });
        }
      }
    }
  );
});
var ScrollAreaScrollbarY = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const { sizes, onSizesChange, ...scrollbarProps } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, props.__scopeScrollArea);
  const [computedStyle, setComputedStyle] = react__WEBPACK_IMPORTED_MODULE_0__.useState();
  const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const composeRefs = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_3__.useComposedRefs)(forwardedRef, ref, context.onScrollbarYChange);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    if (ref.current) setComputedStyle(getComputedStyle(ref.current));
  }, [ref]);
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
    ScrollAreaScrollbarImpl,
    {
      "data-orientation": "vertical",
      ...scrollbarProps,
      ref: composeRefs,
      sizes,
      style: {
        top: 0,
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: "var(--radix-scroll-area-corner-height)",
        ["--radix-scroll-area-thumb-height"]: getThumbSize(sizes) + "px",
        ...props.style
      },
      onThumbPointerDown: (pointerPos) => props.onThumbPointerDown(pointerPos.y),
      onDragScroll: (pointerPos) => props.onDragScroll(pointerPos.y),
      onWheelScroll: (event, maxScrollPos) => {
        if (context.viewport) {
          const scrollPos = context.viewport.scrollTop + event.deltaY;
          props.onWheelScroll(scrollPos);
          if (isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos)) {
            event.preventDefault();
          }
        }
      },
      onResize: () => {
        if (ref.current && context.viewport && computedStyle) {
          onSizesChange({
            content: context.viewport.scrollHeight,
            viewport: context.viewport.offsetHeight,
            scrollbar: {
              size: ref.current.clientHeight,
              paddingStart: toInt(computedStyle.paddingTop),
              paddingEnd: toInt(computedStyle.paddingBottom)
            }
          });
        }
      }
    }
  );
});
var [ScrollbarProvider, useScrollbarContext] = createScrollAreaContext(SCROLLBAR_NAME);
var ScrollAreaScrollbarImpl = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const {
    __scopeScrollArea,
    sizes,
    hasThumb,
    onThumbChange,
    onThumbPointerUp,
    onThumbPointerDown,
    onThumbPositionChange,
    onDragScroll,
    onWheelScroll,
    onResize,
    ...scrollbarProps
  } = props;
  const context = useScrollAreaContext(SCROLLBAR_NAME, __scopeScrollArea);
  const [scrollbar, setScrollbar] = react__WEBPACK_IMPORTED_MODULE_0__.useState(null);
  const composeRefs = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_3__.useComposedRefs)(forwardedRef, (node) => setScrollbar(node));
  const rectRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(null);
  const prevWebkitUserSelectRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef("");
  const viewport = context.viewport;
  const maxScrollPos = sizes.content - sizes.viewport;
  const handleWheelScroll = (0,_radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_8__.useCallbackRef)(onWheelScroll);
  const handleThumbPositionChange = (0,_radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_8__.useCallbackRef)(onThumbPositionChange);
  const handleResize = useDebounceCallback(onResize, 10);
  function handleDragScroll(event) {
    if (rectRef.current) {
      const x = event.clientX - rectRef.current.left;
      const y = event.clientY - rectRef.current.top;
      onDragScroll({ x, y });
    }
  }
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    const handleWheel = (event) => {
      const element = event.target;
      const isScrollbarWheel = scrollbar?.contains(element);
      if (isScrollbarWheel) handleWheelScroll(event, maxScrollPos);
    };
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleWheel, { passive: false });
  }, [viewport, scrollbar, maxScrollPos, handleWheelScroll]);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(handleThumbPositionChange, [sizes, handleThumbPositionChange]);
  useResizeObserver(scrollbar, handleResize);
  useResizeObserver(context.content, handleResize);
  return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
    ScrollbarProvider,
    {
      scope: __scopeScrollArea,
      scrollbar,
      hasThumb,
      onThumbChange: (0,_radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_8__.useCallbackRef)(onThumbChange),
      onThumbPointerUp: (0,_radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_8__.useCallbackRef)(onThumbPointerUp),
      onThumbPositionChange: handleThumbPositionChange,
      onThumbPointerDown: (0,_radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_8__.useCallbackRef)(onThumbPointerDown),
      children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
        _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_5__.Primitive.div,
        {
          ...scrollbarProps,
          ref: composeRefs,
          style: { position: "absolute", ...scrollbarProps.style },
          onPointerDown: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.composeEventHandlers)(props.onPointerDown, (event) => {
            const mainPointer = 0;
            if (event.button === mainPointer) {
              const element = event.target;
              element.setPointerCapture(event.pointerId);
              rectRef.current = scrollbar.getBoundingClientRect();
              prevWebkitUserSelectRef.current = document.body.style.webkitUserSelect;
              document.body.style.webkitUserSelect = "none";
              if (context.viewport) context.viewport.style.scrollBehavior = "auto";
              handleDragScroll(event);
            }
          }),
          onPointerMove: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.composeEventHandlers)(props.onPointerMove, handleDragScroll),
          onPointerUp: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.composeEventHandlers)(props.onPointerUp, (event) => {
            const element = event.target;
            if (element.hasPointerCapture(event.pointerId)) {
              element.releasePointerCapture(event.pointerId);
            }
            document.body.style.webkitUserSelect = prevWebkitUserSelectRef.current;
            if (context.viewport) context.viewport.style.scrollBehavior = "";
            rectRef.current = null;
          })
        }
      )
    }
  );
});
var THUMB_NAME = "ScrollAreaThumb";
var ScrollAreaThumb = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...thumbProps } = props;
    const scrollbarContext = useScrollbarContext(THUMB_NAME, props.__scopeScrollArea);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_6__.Presence, { present: forceMount || scrollbarContext.hasThumb, children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(ScrollAreaThumbImpl, { ref: forwardedRef, ...thumbProps }) });
  }
);
var ScrollAreaThumbImpl = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeScrollArea, style, ...thumbProps } = props;
    const scrollAreaContext = useScrollAreaContext(THUMB_NAME, __scopeScrollArea);
    const scrollbarContext = useScrollbarContext(THUMB_NAME, __scopeScrollArea);
    const { onThumbPositionChange } = scrollbarContext;
    const composedRef = (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_3__.useComposedRefs)(
      forwardedRef,
      (node) => scrollbarContext.onThumbChange(node)
    );
    const removeUnlinkedScrollListenerRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(void 0);
    const debounceScrollEnd = useDebounceCallback(() => {
      if (removeUnlinkedScrollListenerRef.current) {
        removeUnlinkedScrollListenerRef.current();
        removeUnlinkedScrollListenerRef.current = void 0;
      }
    }, 100);
    react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
      const viewport = scrollAreaContext.viewport;
      if (viewport) {
        const handleScroll = () => {
          debounceScrollEnd();
          if (!removeUnlinkedScrollListenerRef.current) {
            const listener = addUnlinkedScrollListener(viewport, onThumbPositionChange);
            removeUnlinkedScrollListenerRef.current = listener;
            onThumbPositionChange();
          }
        };
        onThumbPositionChange();
        viewport.addEventListener("scroll", handleScroll);
        return () => viewport.removeEventListener("scroll", handleScroll);
      }
    }, [scrollAreaContext.viewport, debounceScrollEnd, onThumbPositionChange]);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_5__.Primitive.div,
      {
        "data-state": scrollbarContext.hasThumb ? "visible" : "hidden",
        ...thumbProps,
        ref: composedRef,
        style: {
          width: "var(--radix-scroll-area-thumb-width)",
          height: "var(--radix-scroll-area-thumb-height)",
          ...style
        },
        onPointerDownCapture: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.composeEventHandlers)(props.onPointerDownCapture, (event) => {
          const thumb = event.target;
          const thumbRect = thumb.getBoundingClientRect();
          const x = event.clientX - thumbRect.left;
          const y = event.clientY - thumbRect.top;
          scrollbarContext.onThumbPointerDown({ x, y });
        }),
        onPointerUp: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.composeEventHandlers)(props.onPointerUp, scrollbarContext.onThumbPointerUp)
      }
    );
  }
);
ScrollAreaThumb.displayName = THUMB_NAME;
var CORNER_NAME = "ScrollAreaCorner";
var ScrollAreaCorner = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const context = useScrollAreaContext(CORNER_NAME, props.__scopeScrollArea);
    const hasBothScrollbarsVisible = Boolean(context.scrollbarX && context.scrollbarY);
    const hasCorner = context.type !== "scroll" && hasBothScrollbarsVisible;
    return hasCorner ? /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(ScrollAreaCornerImpl, { ...props, ref: forwardedRef }) : null;
  }
);
ScrollAreaCorner.displayName = CORNER_NAME;
var ScrollAreaCornerImpl = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
  const { __scopeScrollArea, ...cornerProps } = props;
  const context = useScrollAreaContext(CORNER_NAME, __scopeScrollArea);
  const [width, setWidth] = react__WEBPACK_IMPORTED_MODULE_0__.useState(0);
  const [height, setHeight] = react__WEBPACK_IMPORTED_MODULE_0__.useState(0);
  const hasSize = Boolean(width && height);
  useResizeObserver(context.scrollbarX, () => {
    const height2 = context.scrollbarX?.offsetHeight || 0;
    context.onCornerHeightChange(height2);
    setHeight(height2);
  });
  useResizeObserver(context.scrollbarY, () => {
    const width2 = context.scrollbarY?.offsetWidth || 0;
    context.onCornerWidthChange(width2);
    setWidth(width2);
  });
  return hasSize ? /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
    _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_5__.Primitive.div,
    {
      ...cornerProps,
      ref: forwardedRef,
      style: {
        width,
        height,
        position: "absolute",
        right: context.dir === "ltr" ? 0 : void 0,
        left: context.dir === "rtl" ? 0 : void 0,
        bottom: 0,
        ...props.style
      }
    }
  ) : null;
});
function toInt(value) {
  return value ? parseInt(value, 10) : 0;
}
function getThumbRatio(viewportSize, contentSize) {
  const ratio = viewportSize / contentSize;
  return isNaN(ratio) ? 0 : ratio;
}
function getThumbSize(sizes) {
  const ratio = getThumbRatio(sizes.viewport, sizes.content);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const thumbSize = (sizes.scrollbar.size - scrollbarPadding) * ratio;
  return Math.max(thumbSize, 18);
}
function getScrollPositionFromPointer(pointerPos, pointerOffset, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const thumbCenter = thumbSizePx / 2;
  const offset = pointerOffset || thumbCenter;
  const thumbOffsetFromEnd = thumbSizePx - offset;
  const minPointerPos = sizes.scrollbar.paddingStart + offset;
  const maxPointerPos = sizes.scrollbar.size - sizes.scrollbar.paddingEnd - thumbOffsetFromEnd;
  const maxScrollPos = sizes.content - sizes.viewport;
  const scrollRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const interpolate = linearScale([minPointerPos, maxPointerPos], scrollRange);
  return interpolate(pointerPos);
}
function getThumbOffsetFromScroll(scrollPos, sizes, dir = "ltr") {
  const thumbSizePx = getThumbSize(sizes);
  const scrollbarPadding = sizes.scrollbar.paddingStart + sizes.scrollbar.paddingEnd;
  const scrollbar = sizes.scrollbar.size - scrollbarPadding;
  const maxScrollPos = sizes.content - sizes.viewport;
  const maxThumbPos = scrollbar - thumbSizePx;
  const scrollClampRange = dir === "ltr" ? [0, maxScrollPos] : [maxScrollPos * -1, 0];
  const scrollWithoutMomentum = (0,_radix_ui_number__WEBPACK_IMPORTED_MODULE_9__.clamp)(scrollPos, scrollClampRange);
  const interpolate = linearScale([0, maxScrollPos], [0, maxThumbPos]);
  return interpolate(scrollWithoutMomentum);
}
function linearScale(input, output) {
  return (value) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0];
    const ratio = (output[1] - output[0]) / (input[1] - input[0]);
    return output[0] + ratio * (value - input[0]);
  };
}
function isScrollingWithinScrollbarBounds(scrollPos, maxScrollPos) {
  return scrollPos > 0 && scrollPos < maxScrollPos;
}
var addUnlinkedScrollListener = (node, handler = () => {
}) => {
  let prevPosition = { left: node.scrollLeft, top: node.scrollTop };
  let rAF = 0;
  (function loop() {
    const position = { left: node.scrollLeft, top: node.scrollTop };
    const isHorizontalScroll = prevPosition.left !== position.left;
    const isVerticalScroll = prevPosition.top !== position.top;
    if (isHorizontalScroll || isVerticalScroll) handler();
    prevPosition = position;
    rAF = window.requestAnimationFrame(loop);
  })();
  return () => window.cancelAnimationFrame(rAF);
};
function useDebounceCallback(callback, delay) {
  const handleCallback = (0,_radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_8__.useCallbackRef)(callback);
  const debounceTimerRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(0);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);
  return react__WEBPACK_IMPORTED_MODULE_0__.useCallback(() => {
    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(handleCallback, delay);
  }, [handleCallback, delay]);
}
function useResizeObserver(element, onResize) {
  const handleResize = (0,_radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_8__.useCallbackRef)(onResize);
  (0,_radix_ui_react_use_layout_effect__WEBPACK_IMPORTED_MODULE_10__.useLayoutEffect)(() => {
    let rAF = 0;
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(handleResize);
      });
      resizeObserver.observe(element);
      return () => {
        window.cancelAnimationFrame(rAF);
        resizeObserver.unobserve(element);
      };
    }
  }, [element, handleResize]);
}
var Root = ScrollArea;
var Viewport = ScrollAreaViewport;
var Scrollbar = ScrollAreaScrollbar;
var Thumb = ScrollAreaThumb;
var Corner = ScrollAreaCorner;

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-slot/dist/index.mjs":
/*!**********************************************************!*\
  !*** ./node_modules/@radix-ui/react-slot/dist/index.mjs ***!
  \**********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Root: function() { return /* binding */ Slot; },
/* harmony export */   Slot: function() { return /* binding */ Slot; },
/* harmony export */   Slottable: function() { return /* binding */ Slottable; },
/* harmony export */   createSlot: function() { return /* binding */ createSlot; },
/* harmony export */   createSlottable: function() { return /* binding */ createSlottable; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @radix-ui/react-compose-refs */ "./node_modules/@radix-ui/react-compose-refs/dist/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
// packages/react/slot/src/slot.tsx



// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
  const SlotClone = /* @__PURE__ */ createSlotClone(ownerName);
  const Slot2 = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    const childrenArray = react__WEBPACK_IMPORTED_MODULE_0__.Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);
    if (slottable) {
      const newElement = slottable.props.children;
      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          if (react__WEBPACK_IMPORTED_MODULE_0__.Children.count(newElement) > 1) return react__WEBPACK_IMPORTED_MODULE_0__.Children.only(null);
          return react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(newElement) ? newElement.props.children : null;
        } else {
          return child;
        }
      });
      return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children: react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(newElement) ? react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(newElement, void 0, newChildren) : null });
    }
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(SlotClone, { ...slotProps, ref: forwardedRef, children });
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
var Slot = /* @__PURE__ */ createSlot("Slot");
// @__NO_SIDE_EFFECTS__
function createSlotClone(ownerName) {
  const SlotClone = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef((props, forwardedRef) => {
    const { children, ...slotProps } = props;
    if (react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(children)) {
      const childrenRef = getElementRef(children);
      const props2 = mergeProps(slotProps, children.props);
      if (children.type !== react__WEBPACK_IMPORTED_MODULE_0__.Fragment) {
        props2.ref = forwardedRef ? (0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_2__.composeRefs)(forwardedRef, childrenRef) : childrenRef;
      }
      return react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(children, props2);
    }
    return react__WEBPACK_IMPORTED_MODULE_0__.Children.count(children) > 1 ? react__WEBPACK_IMPORTED_MODULE_0__.Children.only(null) : null;
  });
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
// @__NO_SIDE_EFFECTS__
function createSlottable(ownerName) {
  const Slottable2 = ({ children }) => {
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment, { children });
  };
  Slottable2.displayName = `${ownerName}.Slottable`;
  Slottable2.__radixId = SLOTTABLE_IDENTIFIER;
  return Slottable2;
}
var Slottable = /* @__PURE__ */ createSlottable("Slottable");
function isSlottable(child) {
  return react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-tabs/dist/index.mjs":
/*!**********************************************************!*\
  !*** ./node_modules/@radix-ui/react-tabs/dist/index.mjs ***!
  \**********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Content: function() { return /* binding */ Content; },
/* harmony export */   List: function() { return /* binding */ List; },
/* harmony export */   Root: function() { return /* binding */ Root2; },
/* harmony export */   Tabs: function() { return /* binding */ Tabs; },
/* harmony export */   TabsContent: function() { return /* binding */ TabsContent; },
/* harmony export */   TabsList: function() { return /* binding */ TabsList; },
/* harmony export */   TabsTrigger: function() { return /* binding */ TabsTrigger; },
/* harmony export */   Trigger: function() { return /* binding */ Trigger; },
/* harmony export */   createTabsScope: function() { return /* binding */ createTabsScope; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _radix_ui_primitive__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @radix-ui/primitive */ "./node_modules/@radix-ui/primitive/dist/index.mjs");
/* harmony import */ var _radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @radix-ui/react-context */ "./node_modules/@radix-ui/react-context/dist/index.mjs");
/* harmony import */ var _radix_ui_react_roving_focus__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @radix-ui/react-roving-focus */ "./node_modules/@radix-ui/react-roving-focus/dist/index.mjs");
/* harmony import */ var _radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @radix-ui/react-presence */ "./node_modules/@radix-ui/react-presence/dist/index.mjs");
/* harmony import */ var _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @radix-ui/react-primitive */ "./node_modules/@radix-ui/react-primitive/dist/index.mjs");
/* harmony import */ var _radix_ui_react_direction__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @radix-ui/react-direction */ "./node_modules/@radix-ui/react-direction/dist/index.mjs");
/* harmony import */ var _radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @radix-ui/react-use-controllable-state */ "./node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs");
/* harmony import */ var _radix_ui_react_id__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @radix-ui/react-id */ "./node_modules/@radix-ui/react-id/dist/index.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
"use client";

// packages/react/tabs/src/tabs.tsx











var TABS_NAME = "Tabs";
var [createTabsContext, createTabsScope] = (0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__.createContextScope)(TABS_NAME, [
  _radix_ui_react_roving_focus__WEBPACK_IMPORTED_MODULE_3__.createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = (0,_radix_ui_react_roving_focus__WEBPACK_IMPORTED_MODULE_3__.createRovingFocusGroupScope)();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = "automatic",
      ...tabsProps
    } = props;
    const direction = (0,_radix_ui_react_direction__WEBPACK_IMPORTED_MODULE_4__.useDirection)(dir);
    const [value, setValue] = (0,_radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_5__.useControllableState)({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue
    });
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      TabsProvider,
      {
        scope: __scopeTabs,
        baseId: (0,_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_6__.useId)(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
          _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_7__.Primitive.div,
          {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Tabs.displayName = TABS_NAME;
var TAB_LIST_NAME = "TabsList";
var TabsList = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      _radix_ui_react_roving_focus__WEBPACK_IMPORTED_MODULE_3__.Root,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
          _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_7__.Primitive.div,
          {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
TabsList.displayName = TAB_LIST_NAME;
var TRIGGER_NAME = "TabsTrigger";
var TabsTrigger = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      _radix_ui_react_roving_focus__WEBPACK_IMPORTED_MODULE_3__.Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
          _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_7__.Primitive.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_8__.composeEventHandlers)(props.onMouseDown, (event) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                context.onValueChange(value);
              } else {
                event.preventDefault();
              }
            }),
            onKeyDown: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_8__.composeEventHandlers)(props.onKeyDown, (event) => {
              if ([" ", "Enter"].includes(event.key)) context.onValueChange(value);
            }),
            onFocus: (0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_8__.composeEventHandlers)(props.onFocus, () => {
              const isAutomaticActivation = context.activationMode !== "manual";
              if (!isSelected && !disabled && isAutomaticActivation) {
                context.onValueChange(value);
              }
            })
          }
        )
      }
    );
  }
);
TabsTrigger.displayName = TRIGGER_NAME;
var CONTENT_NAME = "TabsContent";
var TabsContent = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(isSelected);
    react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_9__.Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
      _radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_7__.Primitive.div,
      {
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": context.orientation,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        hidden: !present,
        id: contentId,
        tabIndex: 0,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ...props.style,
          animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
        },
        children: present && children
      }
    ) });
  }
);
TabsContent.displayName = CONTENT_NAME;
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
var Root2 = Tabs;
var List = TabsList;
var Trigger = TabsTrigger;
var Content = TabsContent;

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs":
/*!**********************************************************************!*\
  !*** ./node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs ***!
  \**********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useCallbackRef: function() { return /* binding */ useCallbackRef; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
// packages/react/use-callback-ref/src/use-callback-ref.tsx

function useCallbackRef(callback) {
  const callbackRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(callback);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    callbackRef.current = callback;
  });
  return react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => (...args) => callbackRef.current?.(...args), []);
}

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs":
/*!****************************************************************************!*\
  !*** ./node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs ***!
  \****************************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useControllableState: function() { return /* binding */ useControllableState; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var _radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @radix-ui/react-use-callback-ref */ "./node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs");
// packages/react/use-controllable-state/src/use-controllable-state.tsx


function useControllableState({
  prop,
  defaultProp,
  onChange = () => {
  }
}) {
  const [uncontrolledProp, setUncontrolledProp] = useUncontrolledState({ defaultProp, onChange });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  const handleChange = (0,_radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_1__.useCallbackRef)(onChange);
  const setValue = react__WEBPACK_IMPORTED_MODULE_0__.useCallback(
    (nextValue) => {
      if (isControlled) {
        const setter = nextValue;
        const value2 = typeof nextValue === "function" ? setter(prop) : nextValue;
        if (value2 !== prop) handleChange(value2);
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, handleChange]
  );
  return [value, setValue];
}
function useUncontrolledState({
  defaultProp,
  onChange
}) {
  const uncontrolledState = react__WEBPACK_IMPORTED_MODULE_0__.useState(defaultProp);
  const [value] = uncontrolledState;
  const prevValueRef = react__WEBPACK_IMPORTED_MODULE_0__.useRef(value);
  const handleChange = (0,_radix_ui_react_use_callback_ref__WEBPACK_IMPORTED_MODULE_1__.useCallbackRef)(onChange);
  react__WEBPACK_IMPORTED_MODULE_0__.useEffect(() => {
    if (prevValueRef.current !== value) {
      handleChange(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef, handleChange]);
  return uncontrolledState;
}

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs":
/*!***********************************************************************!*\
  !*** ./node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs ***!
  \***********************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useLayoutEffect: function() { return /* binding */ useLayoutEffect2; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
// packages/react/use-layout-effect/src/use-layout-effect.tsx

var useLayoutEffect2 = globalThis?.document ? react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect : () => {
};

//# sourceMappingURL=index.mjs.map


/***/ }),

/***/ "./node_modules/class-variance-authority/dist/index.mjs":
/*!**************************************************************!*\
  !*** ./node_modules/class-variance-authority/dist/index.mjs ***!
  \**************************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cva: function() { return /* binding */ cva; },
/* harmony export */   cx: function() { return /* binding */ cx; }
/* harmony export */ });
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! clsx */ "./node_modules/clsx/dist/clsx.mjs");
/**
 * Copyright 2022 Joe Bell. All rights reserved.
 *
 * This file is licensed to you under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR REPRESENTATIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */ 
const falsyToString = (value)=>typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
const cx = clsx__WEBPACK_IMPORTED_MODULE_0__.clsx;
const cva = (base, config)=>(props)=>{
        var _config_compoundVariants;
        if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
        const { variants, defaultVariants } = config;
        const getVariantClassNames = Object.keys(variants).map((variant)=>{
            const variantProp = props === null || props === void 0 ? void 0 : props[variant];
            const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
            if (variantProp === null) return null;
            const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
            return variants[variant][variantKey];
        });
        const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param)=>{
            let [key, value] = param;
            if (value === undefined) {
                return acc;
            }
            acc[key] = value;
            return acc;
        }, {});
        const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param)=>{
            let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
            return Object.entries(compoundVariantOptions).every((param)=>{
                let [key, value] = param;
                return Array.isArray(value) ? value.includes({
                    ...defaultVariants,
                    ...propsWithoutUndefined
                }[key]) : ({
                    ...defaultVariants,
                    ...propsWithoutUndefined
                })[key] === value;
            }) ? [
                ...acc,
                cvClass,
                cvClassName
            ] : acc;
        }, []);
        return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
    };



/***/ }),

/***/ "./node_modules/clsx/dist/clsx.mjs":
/*!*****************************************!*\
  !*** ./node_modules/clsx/dist/clsx.mjs ***!
  \*****************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clsx: function() { return /* binding */ clsx; }
/* harmony export */ });
function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f)}else for(f in e)e[f]&&(n&&(n+=" "),n+=f);return n}function clsx(){for(var e,t,f=0,n="",o=arguments.length;f<o;f++)(e=arguments[f])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}/* harmony default export */ __webpack_exports__["default"] = (clsx);

/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/Icon.js":
/*!****************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/Icon.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Icon; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _defaultAttributes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./defaultAttributes.js */ "./node_modules/lucide-react/dist/esm/defaultAttributes.js");
/* harmony import */ var _shared_src_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shared/src/utils.js */ "./node_modules/lucide-react/dist/esm/shared/src/utils.js");
/**
 * @license lucide-react v0.461.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */





const Icon = (0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => {
    return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(
      "svg",
      {
        ref,
        ..._defaultAttributes_js__WEBPACK_IMPORTED_MODULE_1__["default"],
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: (0,_shared_src_utils_js__WEBPACK_IMPORTED_MODULE_2__.mergeClasses)("lucide", className),
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);


//# sourceMappingURL=Icon.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/createLucideIcon.js":
/*!****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/createLucideIcon.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ createLucideIcon; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shared_src_utils_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shared/src/utils.js */ "./node_modules/lucide-react/dist/esm/shared/src/utils.js");
/* harmony import */ var _Icon_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Icon.js */ "./node_modules/lucide-react/dist/esm/Icon.js");
/**
 * @license lucide-react v0.461.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */





const createLucideIcon = (iconName, iconNode) => {
  const Component = (0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(
    ({ className, ...props }, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_Icon_js__WEBPACK_IMPORTED_MODULE_1__["default"], {
      ref,
      iconNode,
      className: (0,_shared_src_utils_js__WEBPACK_IMPORTED_MODULE_2__.mergeClasses)(`lucide-${(0,_shared_src_utils_js__WEBPACK_IMPORTED_MODULE_2__.toKebabCase)(iconName)}`, className),
      ...props
    })
  );
  Component.displayName = `${iconName}`;
  return Component;
};


//# sourceMappingURL=createLucideIcon.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/defaultAttributes.js":
/*!*****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/defaultAttributes.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ defaultAttributes; }
/* harmony export */ });
/**
 * @license lucide-react v0.461.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};


//# sourceMappingURL=defaultAttributes.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/search-x.js":
/*!**************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/search-x.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ SearchX; }
/* harmony export */ });
/* harmony import */ var _createLucideIcon_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.js */ "./node_modules/lucide-react/dist/esm/createLucideIcon.js");
/**
 * @license lucide-react v0.461.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const SearchX = (0,_createLucideIcon_js__WEBPACK_IMPORTED_MODULE_0__["default"])("SearchX", [
  ["path", { d: "m13.5 8.5-5 5", key: "1cs55j" }],
  ["path", { d: "m8.5 8.5 5 5", key: "a8mexj" }],
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);


//# sourceMappingURL=search-x.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/icons/search.js":
/*!************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/icons/search.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Search; }
/* harmony export */ });
/* harmony import */ var _createLucideIcon_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../createLucideIcon.js */ "./node_modules/lucide-react/dist/esm/createLucideIcon.js");
/**
 * @license lucide-react v0.461.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */



const Search = (0,_createLucideIcon_js__WEBPACK_IMPORTED_MODULE_0__["default"])("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);


//# sourceMappingURL=search.js.map


/***/ }),

/***/ "./node_modules/lucide-react/dist/esm/shared/src/utils.js":
/*!****************************************************************!*\
  !*** ./node_modules/lucide-react/dist/esm/shared/src/utils.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mergeClasses: function() { return /* binding */ mergeClasses; },
/* harmony export */   toKebabCase: function() { return /* binding */ toKebabCase; }
/* harmony export */ });
/**
 * @license lucide-react v0.461.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */

const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();


//# sourceMappingURL=utils.js.map


/***/ }),

/***/ "./node_modules/react/cjs/react-jsx-runtime.development.js":
/*!*****************************************************************!*\
  !*** ./node_modules/react/cjs/react-jsx-runtime.development.js ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (true) {
  (function() {
'use strict';

var React = __webpack_require__(/*! react */ "react");

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types.
var REACT_ELEMENT_TYPE = Symbol.for('react.element');
var REACT_PORTAL_TYPE = Symbol.for('react.portal');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
var REACT_CONTEXT_TYPE = Symbol.for('react.context');
var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
var REACT_MEMO_TYPE = Symbol.for('react.memo');
var REACT_LAZY_TYPE = Symbol.for('react.lazy');
var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null;
  }

  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }

  return null;
}

var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

function error(format) {
  {
    {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      printWarning('error', format, args);
    }
  }
}

function printWarning(level, format, args) {
  // When changing this logic, you might want to also
  // update consoleWithStackDev.www.js as well.
  {
    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
    var stack = ReactDebugCurrentFrame.getStackAddendum();

    if (stack !== '') {
      format += '%s';
      args = args.concat([stack]);
    } // eslint-disable-next-line react-internal/safe-string-coercion


    var argsWithFormat = args.map(function (item) {
      return String(item);
    }); // Careful: RN currently depends on this prefix

    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
    // breaks IE9: https://github.com/facebook/react/issues/13610
    // eslint-disable-next-line react-internal/no-production-logging

    Function.prototype.apply.call(console[level], console, argsWithFormat);
  }
}

// -----------------------------------------------------------------------------

var enableScopeAPI = false; // Experimental Create Event Handle API.
var enableCacheElement = false;
var enableTransitionTracing = false; // No known bugs, but needs performance testing

var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
// stuff. Intended to enable React core members to more easily debug scheduling
// issues in DEV builds.

var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

var REACT_MODULE_REFERENCE;

{
  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
}

function isValidElementType(type) {
  if (typeof type === 'string' || typeof type === 'function') {
    return true;
  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
    return true;
  }

  if (typeof type === 'object' && type !== null) {
    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
    // types supported by any Flight configuration anywhere since
    // we don't know which Flight build this will end up being used
    // with.
    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
      return true;
    }
  }

  return false;
}

function getWrappedName(outerType, innerType, wrapperName) {
  var displayName = outerType.displayName;

  if (displayName) {
    return displayName;
  }

  var functionName = innerType.displayName || innerType.name || '';
  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
} // Keep in sync with react-reconciler/getComponentNameFromFiber


function getContextName(type) {
  return type.displayName || 'Context';
} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


function getComponentNameFromType(type) {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }

  {
    if (typeof type.tag === 'number') {
      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
    }
  }

  if (typeof type === 'function') {
    return type.displayName || type.name || null;
  }

  if (typeof type === 'string') {
    return type;
  }

  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'Fragment';

    case REACT_PORTAL_TYPE:
      return 'Portal';

    case REACT_PROFILER_TYPE:
      return 'Profiler';

    case REACT_STRICT_MODE_TYPE:
      return 'StrictMode';

    case REACT_SUSPENSE_TYPE:
      return 'Suspense';

    case REACT_SUSPENSE_LIST_TYPE:
      return 'SuspenseList';

  }

  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_CONTEXT_TYPE:
        var context = type;
        return getContextName(context) + '.Consumer';

      case REACT_PROVIDER_TYPE:
        var provider = type;
        return getContextName(provider._context) + '.Provider';

      case REACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef');

      case REACT_MEMO_TYPE:
        var outerName = type.displayName || null;

        if (outerName !== null) {
          return outerName;
        }

        return getComponentNameFromType(type.type) || 'Memo';

      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;

          try {
            return getComponentNameFromType(init(payload));
          } catch (x) {
            return null;
          }
        }

      // eslint-disable-next-line no-fallthrough
    }
  }

  return null;
}

var assign = Object.assign;

// Helpers to patch console.logs to avoid logging during side-effect free
// replaying on render function. This currently only patches the object
// lazily which won't cover if the log function was extracted eagerly.
// We could also eagerly patch the method.
var disabledDepth = 0;
var prevLog;
var prevInfo;
var prevWarn;
var prevError;
var prevGroup;
var prevGroupCollapsed;
var prevGroupEnd;

function disabledLog() {}

disabledLog.__reactDisabledLog = true;
function disableLogs() {
  {
    if (disabledDepth === 0) {
      /* eslint-disable react-internal/no-production-logging */
      prevLog = console.log;
      prevInfo = console.info;
      prevWarn = console.warn;
      prevError = console.error;
      prevGroup = console.group;
      prevGroupCollapsed = console.groupCollapsed;
      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

      var props = {
        configurable: true,
        enumerable: true,
        value: disabledLog,
        writable: true
      }; // $FlowFixMe Flow thinks console is immutable.

      Object.defineProperties(console, {
        info: props,
        log: props,
        warn: props,
        error: props,
        group: props,
        groupCollapsed: props,
        groupEnd: props
      });
      /* eslint-enable react-internal/no-production-logging */
    }

    disabledDepth++;
  }
}
function reenableLogs() {
  {
    disabledDepth--;

    if (disabledDepth === 0) {
      /* eslint-disable react-internal/no-production-logging */
      var props = {
        configurable: true,
        enumerable: true,
        writable: true
      }; // $FlowFixMe Flow thinks console is immutable.

      Object.defineProperties(console, {
        log: assign({}, props, {
          value: prevLog
        }),
        info: assign({}, props, {
          value: prevInfo
        }),
        warn: assign({}, props, {
          value: prevWarn
        }),
        error: assign({}, props, {
          value: prevError
        }),
        group: assign({}, props, {
          value: prevGroup
        }),
        groupCollapsed: assign({}, props, {
          value: prevGroupCollapsed
        }),
        groupEnd: assign({}, props, {
          value: prevGroupEnd
        })
      });
      /* eslint-enable react-internal/no-production-logging */
    }

    if (disabledDepth < 0) {
      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
    }
  }
}

var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
var prefix;
function describeBuiltInComponentFrame(name, source, ownerFn) {
  {
    if (prefix === undefined) {
      // Extract the VM specific prefix used by each line.
      try {
        throw Error();
      } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || '';
      }
    } // We use the prefix to ensure our stacks line up with native stack frames.


    return '\n' + prefix + name;
  }
}
var reentry = false;
var componentFrameCache;

{
  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
  componentFrameCache = new PossiblyWeakMap();
}

function describeNativeComponentFrame(fn, construct) {
  // If something asked for a stack inside a fake render, it should get ignored.
  if ( !fn || reentry) {
    return '';
  }

  {
    var frame = componentFrameCache.get(fn);

    if (frame !== undefined) {
      return frame;
    }
  }

  var control;
  reentry = true;
  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

  Error.prepareStackTrace = undefined;
  var previousDispatcher;

  {
    previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
    // for warnings.

    ReactCurrentDispatcher.current = null;
    disableLogs();
  }

  try {
    // This should throw.
    if (construct) {
      // Something should be setting the props in the constructor.
      var Fake = function () {
        throw Error();
      }; // $FlowFixMe


      Object.defineProperty(Fake.prototype, 'props', {
        set: function () {
          // We use a throwing setter instead of frozen or non-writable props
          // because that won't throw in a non-strict mode function.
          throw Error();
        }
      });

      if (typeof Reflect === 'object' && Reflect.construct) {
        // We construct a different control for this case to include any extra
        // frames added by the construct call.
        try {
          Reflect.construct(Fake, []);
        } catch (x) {
          control = x;
        }

        Reflect.construct(fn, [], Fake);
      } else {
        try {
          Fake.call();
        } catch (x) {
          control = x;
        }

        fn.call(Fake.prototype);
      }
    } else {
      try {
        throw Error();
      } catch (x) {
        control = x;
      }

      fn();
    }
  } catch (sample) {
    // This is inlined manually because closure doesn't do it for us.
    if (sample && control && typeof sample.stack === 'string') {
      // This extracts the first frame from the sample that isn't also in the control.
      // Skipping one frame that we assume is the frame that calls the two.
      var sampleLines = sample.stack.split('\n');
      var controlLines = control.stack.split('\n');
      var s = sampleLines.length - 1;
      var c = controlLines.length - 1;

      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
        // We expect at least one stack frame to be shared.
        // Typically this will be the root most one. However, stack frames may be
        // cut off due to maximum stack limits. In this case, one maybe cut off
        // earlier than the other. We assume that the sample is longer or the same
        // and there for cut off earlier. So we should find the root most frame in
        // the sample somewhere in the control.
        c--;
      }

      for (; s >= 1 && c >= 0; s--, c--) {
        // Next we find the first one that isn't the same which should be the
        // frame that called our sample function and the control.
        if (sampleLines[s] !== controlLines[c]) {
          // In V8, the first line is describing the message but other VMs don't.
          // If we're about to return the first line, and the control is also on the same
          // line, that's a pretty good indicator that our sample threw at same line as
          // the control. I.e. before we entered the sample frame. So we ignore this result.
          // This can happen if you passed a class to function component, or non-function.
          if (s !== 1 || c !== 1) {
            do {
              s--;
              c--; // We may still have similar intermediate frames from the construct call.
              // The next one that isn't the same should be our match though.

              if (c < 0 || sampleLines[s] !== controlLines[c]) {
                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
                // but we have a user-provided "displayName"
                // splice it in to make the stack more readable.


                if (fn.displayName && _frame.includes('<anonymous>')) {
                  _frame = _frame.replace('<anonymous>', fn.displayName);
                }

                {
                  if (typeof fn === 'function') {
                    componentFrameCache.set(fn, _frame);
                  }
                } // Return the line we found.


                return _frame;
              }
            } while (s >= 1 && c >= 0);
          }

          break;
        }
      }
    }
  } finally {
    reentry = false;

    {
      ReactCurrentDispatcher.current = previousDispatcher;
      reenableLogs();
    }

    Error.prepareStackTrace = previousPrepareStackTrace;
  } // Fallback to just using the name if we couldn't make it throw.


  var name = fn ? fn.displayName || fn.name : '';
  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

  {
    if (typeof fn === 'function') {
      componentFrameCache.set(fn, syntheticFrame);
    }
  }

  return syntheticFrame;
}
function describeFunctionComponentFrame(fn, source, ownerFn) {
  {
    return describeNativeComponentFrame(fn, false);
  }
}

function shouldConstruct(Component) {
  var prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}

function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

  if (type == null) {
    return '';
  }

  if (typeof type === 'function') {
    {
      return describeNativeComponentFrame(type, shouldConstruct(type));
    }
  }

  if (typeof type === 'string') {
    return describeBuiltInComponentFrame(type);
  }

  switch (type) {
    case REACT_SUSPENSE_TYPE:
      return describeBuiltInComponentFrame('Suspense');

    case REACT_SUSPENSE_LIST_TYPE:
      return describeBuiltInComponentFrame('SuspenseList');
  }

  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        return describeFunctionComponentFrame(type.render);

      case REACT_MEMO_TYPE:
        // Memo may contain any component type so we recursively resolve it.
        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;

          try {
            // Lazy may contain any component type so we recursively resolve it.
            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
          } catch (x) {}
        }
    }
  }

  return '';
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

var loggedTypeFailures = {};
var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

function setCurrentlyValidatingElement(element) {
  {
    if (element) {
      var owner = element._owner;
      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
      ReactDebugCurrentFrame.setExtraStackFrame(stack);
    } else {
      ReactDebugCurrentFrame.setExtraStackFrame(null);
    }
  }
}

function checkPropTypes(typeSpecs, values, location, componentName, element) {
  {
    // $FlowFixMe This is okay but Flow doesn't know it.
    var has = Function.call.bind(hasOwnProperty);

    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.

        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            // eslint-disable-next-line react-internal/prod-error-codes
            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
            err.name = 'Invariant Violation';
            throw err;
          }

          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
        } catch (ex) {
          error$1 = ex;
        }

        if (error$1 && !(error$1 instanceof Error)) {
          setCurrentlyValidatingElement(element);

          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

          setCurrentlyValidatingElement(null);
        }

        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error$1.message] = true;
          setCurrentlyValidatingElement(element);

          error('Failed %s type: %s', location, error$1.message);

          setCurrentlyValidatingElement(null);
        }
      }
    }
  }
}

var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

function isArray(a) {
  return isArrayImpl(a);
}

/*
 * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
 *
 * The functions in this module will throw an easier-to-understand,
 * easier-to-debug exception with a clear errors message message explaining the
 * problem. (Instead of a confusing exception thrown inside the implementation
 * of the `value` object).
 */
// $FlowFixMe only called in DEV, so void return is not possible.
function typeName(value) {
  {
    // toStringTag is needed for namespaced types like Temporal.Instant
    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
    return type;
  }
} // $FlowFixMe only called in DEV, so void return is not possible.


function willCoercionThrow(value) {
  {
    try {
      testStringCoercion(value);
      return false;
    } catch (e) {
      return true;
    }
  }
}

function testStringCoercion(value) {
  // If you ended up here by following an exception call stack, here's what's
  // happened: you supplied an object or symbol value to React (as a prop, key,
  // DOM attribute, CSS property, string ref, etc.) and when React tried to
  // coerce it to a string using `'' + value`, an exception was thrown.
  //
  // The most common types that will cause this exception are `Symbol` instances
  // and Temporal objects like `Temporal.Instant`. But any object that has a
  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
  // exception. (Library authors do this to prevent users from using built-in
  // numeric operators like `+` or comparison operators like `>=` because custom
  // methods are needed to perform accurate arithmetic or comparison.)
  //
  // To fix the problem, coerce this object or symbol value to a string before
  // passing it to React. The most reliable way is usually `String(value)`.
  //
  // To find which value is throwing, check the browser or debugger console.
  // Before this exception was thrown, there should be `console.error` output
  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
  // problem and how that type was used: key, atrribute, input value prop, etc.
  // In most cases, this console output also shows the component and its
  // ancestor components where the exception happened.
  //
  // eslint-disable-next-line react-internal/safe-string-coercion
  return '' + value;
}
function checkKeyStringCoercion(value) {
  {
    if (willCoercionThrow(value)) {
      error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
    }
  }
}

var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};
var specialPropKeyWarningShown;
var specialPropRefWarningShown;
var didWarnAboutStringRefs;

{
  didWarnAboutStringRefs = {};
}

function hasValidRef(config) {
  {
    if (hasOwnProperty.call(config, 'ref')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }

  return config.ref !== undefined;
}

function hasValidKey(config) {
  {
    if (hasOwnProperty.call(config, 'key')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }

  return config.key !== undefined;
}

function warnIfStringRefCannotBeAutoConverted(config, self) {
  {
    if (typeof config.ref === 'string' && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
      var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);

      if (!didWarnAboutStringRefs[componentName]) {
        error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);

        didWarnAboutStringRefs[componentName] = true;
      }
    }
  }
}

function defineKeyPropWarningGetter(props, displayName) {
  {
    var warnAboutAccessingKey = function () {
      if (!specialPropKeyWarningShown) {
        specialPropKeyWarningShown = true;

        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
      }
    };

    warnAboutAccessingKey.isReactWarning = true;
    Object.defineProperty(props, 'key', {
      get: warnAboutAccessingKey,
      configurable: true
    });
  }
}

function defineRefPropWarningGetter(props, displayName) {
  {
    var warnAboutAccessingRef = function () {
      if (!specialPropRefWarningShown) {
        specialPropRefWarningShown = true;

        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
      }
    };

    warnAboutAccessingRef.isReactWarning = true;
    Object.defineProperty(props, 'ref', {
      get: warnAboutAccessingRef,
      configurable: true
    });
  }
}
/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, instanceof check
 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} props
 * @param {*} key
 * @param {string|object} ref
 * @param {*} owner
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @internal
 */


var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,
    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,
    // Record the component responsible for creating this element.
    _owner: owner
  };

  {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.

    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false
    }); // self and source are DEV only properties.

    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self
    }); // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.

    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source
    });

    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};
/**
 * https://github.com/reactjs/rfcs/pull/107
 * @param {*} type
 * @param {object} props
 * @param {string} key
 */

function jsxDEV(type, config, maybeKey, source, self) {
  {
    var propName; // Reserved names are extracted

    var props = {};
    var key = null;
    var ref = null; // Currently, key can be spread in as a prop. This causes a potential
    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
    // but as an intermediary step, we will use jsxDEV for everything except
    // <div {...props} key="Hi" />, because we aren't currently able to tell if
    // key is explicitly declared to be undefined or not.

    if (maybeKey !== undefined) {
      {
        checkKeyStringCoercion(maybeKey);
      }

      key = '' + maybeKey;
    }

    if (hasValidKey(config)) {
      {
        checkKeyStringCoercion(config.key);
      }

      key = '' + config.key;
    }

    if (hasValidRef(config)) {
      ref = config.ref;
      warnIfStringRefCannotBeAutoConverted(config, self);
    } // Remaining properties are added to a new props object


    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    } // Resolve default props


    if (type && type.defaultProps) {
      var defaultProps = type.defaultProps;

      for (propName in defaultProps) {
        if (props[propName] === undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }

    if (key || ref) {
      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

      if (key) {
        defineKeyPropWarningGetter(props, displayName);
      }

      if (ref) {
        defineRefPropWarningGetter(props, displayName);
      }
    }

    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
  }
}

var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

function setCurrentlyValidatingElement$1(element) {
  {
    if (element) {
      var owner = element._owner;
      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
    } else {
      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
    }
  }
}

var propTypesMisspellWarningShown;

{
  propTypesMisspellWarningShown = false;
}
/**
 * Verifies the object is a ReactElement.
 * See https://reactjs.org/docs/react-api.html#isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a ReactElement.
 * @final
 */


function isValidElement(object) {
  {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  }
}

function getDeclarationErrorAddendum() {
  {
    if (ReactCurrentOwner$1.current) {
      var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);

      if (name) {
        return '\n\nCheck the render method of `' + name + '`.';
      }
    }

    return '';
  }
}

function getSourceInfoErrorAddendum(source) {
  {
    if (source !== undefined) {
      var fileName = source.fileName.replace(/^.*[\\\/]/, '');
      var lineNumber = source.lineNumber;
      return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
    }

    return '';
  }
}
/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */


var ownerHasKeyUseWarning = {};

function getCurrentComponentErrorInfo(parentType) {
  {
    var info = getDeclarationErrorAddendum();

    if (!info) {
      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

      if (parentName) {
        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
      }
    }

    return info;
  }
}
/**
 * Warn if the element doesn't have an explicit key assigned to it.
 * This element is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it. Error statuses are cached so a warning
 * will only be shown once.
 *
 * @internal
 * @param {ReactElement} element Element that requires a key.
 * @param {*} parentType element's parent's type.
 */


function validateExplicitKey(element, parentType) {
  {
    if (!element._store || element._store.validated || element.key != null) {
      return;
    }

    element._store.validated = true;
    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
      return;
    }

    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
    // property, it may be the creator of the child that's responsible for
    // assigning it a key.

    var childOwner = '';

    if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
      // Give the component that originally created this child.
      childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
    }

    setCurrentlyValidatingElement$1(element);

    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

    setCurrentlyValidatingElement$1(null);
  }
}
/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */


function validateChildKeys(node, parentType) {
  {
    if (typeof node !== 'object') {
      return;
    }

    if (isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        var child = node[i];

        if (isValidElement(child)) {
          validateExplicitKey(child, parentType);
        }
      }
    } else if (isValidElement(node)) {
      // This element was passed in a valid location.
      if (node._store) {
        node._store.validated = true;
      }
    } else if (node) {
      var iteratorFn = getIteratorFn(node);

      if (typeof iteratorFn === 'function') {
        // Entry iterators used to provide implicit keys,
        // but now we print a separate warning for them later.
        if (iteratorFn !== node.entries) {
          var iterator = iteratorFn.call(node);
          var step;

          while (!(step = iterator.next()).done) {
            if (isValidElement(step.value)) {
              validateExplicitKey(step.value, parentType);
            }
          }
        }
      }
    }
  }
}
/**
 * Given an element, validate that its props follow the propTypes definition,
 * provided by the type.
 *
 * @param {ReactElement} element
 */


function validatePropTypes(element) {
  {
    var type = element.type;

    if (type === null || type === undefined || typeof type === 'string') {
      return;
    }

    var propTypes;

    if (typeof type === 'function') {
      propTypes = type.propTypes;
    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
    // Inner props are checked in the reconciler.
    type.$$typeof === REACT_MEMO_TYPE)) {
      propTypes = type.propTypes;
    } else {
      return;
    }

    if (propTypes) {
      // Intentionally inside to avoid triggering lazy initializers:
      var name = getComponentNameFromType(type);
      checkPropTypes(propTypes, element.props, 'prop', name, element);
    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

      var _name = getComponentNameFromType(type);

      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
    }

    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
    }
  }
}
/**
 * Given a fragment, validate that it can only be provided with fragment props
 * @param {ReactElement} fragment
 */


function validateFragmentProps(fragment) {
  {
    var keys = Object.keys(fragment.props);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];

      if (key !== 'children' && key !== 'key') {
        setCurrentlyValidatingElement$1(fragment);

        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

        setCurrentlyValidatingElement$1(null);
        break;
      }
    }

    if (fragment.ref !== null) {
      setCurrentlyValidatingElement$1(fragment);

      error('Invalid attribute `ref` supplied to `React.Fragment`.');

      setCurrentlyValidatingElement$1(null);
    }
  }
}

var didWarnAboutKeySpread = {};
function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
  {
    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
    // succeed and there will likely be errors in render.

    if (!validType) {
      var info = '';

      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
      }

      var sourceInfo = getSourceInfoErrorAddendum(source);

      if (sourceInfo) {
        info += sourceInfo;
      } else {
        info += getDeclarationErrorAddendum();
      }

      var typeString;

      if (type === null) {
        typeString = 'null';
      } else if (isArray(type)) {
        typeString = 'array';
      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
        typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
        info = ' Did you accidentally export a JSX literal instead of a component?';
      } else {
        typeString = typeof type;
      }

      error('React.jsx: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
    }

    var element = jsxDEV(type, props, key, source, self); // The result can be nullish if a mock or a custom function is used.
    // TODO: Drop this when these are no longer allowed as the type argument.

    if (element == null) {
      return element;
    } // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing errors.
    // We don't want exception behavior to differ between dev and prod.
    // (Rendering will throw with a helpful message and as soon as the type is
    // fixed, the key warnings will appear.)


    if (validType) {
      var children = props.children;

      if (children !== undefined) {
        if (isStaticChildren) {
          if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              validateChildKeys(children[i], type);
            }

            if (Object.freeze) {
              Object.freeze(children);
            }
          } else {
            error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
          }
        } else {
          validateChildKeys(children, type);
        }
      }
    }

    {
      if (hasOwnProperty.call(props, 'key')) {
        var componentName = getComponentNameFromType(type);
        var keys = Object.keys(props).filter(function (k) {
          return k !== 'key';
        });
        var beforeExample = keys.length > 0 ? '{key: someKey, ' + keys.join(': ..., ') + ': ...}' : '{key: someKey}';

        if (!didWarnAboutKeySpread[componentName + beforeExample]) {
          var afterExample = keys.length > 0 ? '{' + keys.join(': ..., ') + ': ...}' : '{}';

          error('A props object containing a "key" prop is being spread into JSX:\n' + '  let props = %s;\n' + '  <%s {...props} />\n' + 'React keys must be passed directly to JSX without using spread:\n' + '  let props = %s;\n' + '  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);

          didWarnAboutKeySpread[componentName + beforeExample] = true;
        }
      }
    }

    if (type === REACT_FRAGMENT_TYPE) {
      validateFragmentProps(element);
    } else {
      validatePropTypes(element);
    }

    return element;
  }
} // These two functions exist to still get child warnings in dev
// even with the prod transform. This means that jsxDEV is purely
// opt-in behavior for better messages but that we won't stop
// giving you warnings if you use production apis.

function jsxWithValidationStatic(type, props, key) {
  {
    return jsxWithValidation(type, props, key, true);
  }
}
function jsxWithValidationDynamic(type, props, key) {
  {
    return jsxWithValidation(type, props, key, false);
  }
}

var jsx =  jsxWithValidationDynamic ; // we may want to special case jsxs internally to take advantage of static children.
// for now we can ship identical prod functions

var jsxs =  jsxWithValidationStatic ;

exports.Fragment = REACT_FRAGMENT_TYPE;
exports.jsx = jsx;
exports.jsxs = jsxs;
  })();
}


/***/ }),

/***/ "./node_modules/react/jsx-runtime.js":
/*!*******************************************!*\
  !*** ./node_modules/react/jsx-runtime.js ***!
  \*******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {



if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/react-jsx-runtime.development.js */ "./node_modules/react/cjs/react-jsx-runtime.development.js");
}


/***/ }),

/***/ "./node_modules/tailwind-merge/dist/bundle-mjs.mjs":
/*!*********************************************************!*\
  !*** ./node_modules/tailwind-merge/dist/bundle-mjs.mjs ***!
  \*********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createTailwindMerge: function() { return /* binding */ createTailwindMerge; },
/* harmony export */   extendTailwindMerge: function() { return /* binding */ extendTailwindMerge; },
/* harmony export */   fromTheme: function() { return /* binding */ fromTheme; },
/* harmony export */   getDefaultConfig: function() { return /* binding */ getDefaultConfig; },
/* harmony export */   mergeConfigs: function() { return /* binding */ mergeConfigs; },
/* harmony export */   twJoin: function() { return /* binding */ twJoin; },
/* harmony export */   twMerge: function() { return /* binding */ twMerge; },
/* harmony export */   validators: function() { return /* binding */ validators; }
/* harmony export */ });
const CLASS_PART_SEPARATOR = '-';
const createClassGroupUtils = config => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = className => {
    const classParts = className.split(CLASS_PART_SEPARATOR);
    // Classes like `-inset-1` produce an empty string as first classPart. We assume that classes for negative values are used correctly and remove it from classParts.
    if (classParts[0] === '' && classParts.length !== 1) {
      classParts.shift();
    }
    return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    const conflicts = conflictingClassGroups[classGroupId] || [];
    if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
      return [...conflicts, ...conflictingClassGroupModifiers[classGroupId]];
    }
    return conflicts;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, classPartObject) => {
  if (classParts.length === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[0];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  const classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : undefined;
  if (classGroupFromNextClassPart) {
    return classGroupFromNextClassPart;
  }
  if (classPartObject.validators.length === 0) {
    return undefined;
  }
  const classRest = classParts.join(CLASS_PART_SEPARATOR);
  return classPartObject.validators.find(({
    validator
  }) => validator(classRest))?.classGroupId;
};
const arbitraryPropertyRegex = /^\[(.+)\]$/;
const getGroupIdForArbitraryProperty = className => {
  if (arbitraryPropertyRegex.test(className)) {
    const arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
    const property = arbitraryPropertyClassName?.substring(0, arbitraryPropertyClassName.indexOf(':'));
    if (property) {
      // I use two dots here because one dot is used as prefix for class groups in plugins
      return 'arbitrary..' + property;
    }
  }
};
/**
 * Exported for testing only
 */
const createClassMap = config => {
  const {
    theme,
    prefix
  } = config;
  const classMap = {
    nextPart: new Map(),
    validators: []
  };
  const prefixedClassGroupEntries = getPrefixedClassGroupEntries(Object.entries(config.classGroups), prefix);
  prefixedClassGroupEntries.forEach(([classGroupId, classGroup]) => {
    processClassesRecursively(classGroup, classMap, classGroupId, theme);
  });
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  classGroup.forEach(classDefinition => {
    if (typeof classDefinition === 'string') {
      const classPartObjectToEdit = classDefinition === '' ? classPartObject : getPart(classPartObject, classDefinition);
      classPartObjectToEdit.classGroupId = classGroupId;
      return;
    }
    if (typeof classDefinition === 'function') {
      if (isThemeGetter(classDefinition)) {
        processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
        return;
      }
      classPartObject.validators.push({
        validator: classDefinition,
        classGroupId
      });
      return;
    }
    Object.entries(classDefinition).forEach(([key, classGroup]) => {
      processClassesRecursively(classGroup, getPart(classPartObject, key), classGroupId, theme);
    });
  });
};
const getPart = (classPartObject, path) => {
  let currentClassPartObject = classPartObject;
  path.split(CLASS_PART_SEPARATOR).forEach(pathPart => {
    if (!currentClassPartObject.nextPart.has(pathPart)) {
      currentClassPartObject.nextPart.set(pathPart, {
        nextPart: new Map(),
        validators: []
      });
    }
    currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
  });
  return currentClassPartObject;
};
const isThemeGetter = func => func.isThemeGetter;
const getPrefixedClassGroupEntries = (classGroupEntries, prefix) => {
  if (!prefix) {
    return classGroupEntries;
  }
  return classGroupEntries.map(([classGroupId, classGroup]) => {
    const prefixedClassGroup = classGroup.map(classDefinition => {
      if (typeof classDefinition === 'string') {
        return prefix + classDefinition;
      }
      if (typeof classDefinition === 'object') {
        return Object.fromEntries(Object.entries(classDefinition).map(([key, value]) => [prefix + key, value]));
      }
      return classDefinition;
    });
    return [classGroupId, prefixedClassGroup];
  });
};

// LRU cache inspired from hashlru (https://github.com/dominictarr/hashlru/blob/v1.0.4/index.js) but object replaced with Map to improve performance
const createLruCache = maxCacheSize => {
  if (maxCacheSize < 1) {
    return {
      get: () => undefined,
      set: () => {}
    };
  }
  let cacheSize = 0;
  let cache = new Map();
  let previousCache = new Map();
  const update = (key, value) => {
    cache.set(key, value);
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = new Map();
    }
  };
  return {
    get(key) {
      let value = cache.get(key);
      if (value !== undefined) {
        return value;
      }
      if ((value = previousCache.get(key)) !== undefined) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (cache.has(key)) {
        cache.set(key, value);
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = '!';
const createParseClassName = config => {
  const {
    separator,
    experimentalParseClassName
  } = config;
  const isSeparatorSingleCharacter = separator.length === 1;
  const firstSeparatorCharacter = separator[0];
  const separatorLength = separator.length;
  // parseClassName inspired by https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
  const parseClassName = className => {
    const modifiers = [];
    let bracketDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    for (let index = 0; index < className.length; index++) {
      let currentCharacter = className[index];
      if (bracketDepth === 0) {
        if (currentCharacter === firstSeparatorCharacter && (isSeparatorSingleCharacter || className.slice(index, index + separatorLength) === separator)) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + separatorLength;
          continue;
        }
        if (currentCharacter === '/') {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === '[') {
        bracketDepth++;
      } else if (currentCharacter === ']') {
        bracketDepth--;
      }
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
    const hasImportantModifier = baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER);
    const baseClassName = hasImportantModifier ? baseClassNameWithImportantModifier.substring(1) : baseClassNameWithImportantModifier;
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : undefined;
    return {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    };
  };
  if (experimentalParseClassName) {
    return className => experimentalParseClassName({
      className,
      parseClassName
    });
  }
  return parseClassName;
};
/**
 * Sorts modifiers according to following schema:
 * - Predefined modifiers are sorted alphabetically
 * - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
 */
const sortModifiers = modifiers => {
  if (modifiers.length <= 1) {
    return modifiers;
  }
  const sortedModifiers = [];
  let unsortedModifiers = [];
  modifiers.forEach(modifier => {
    const isArbitraryVariant = modifier[0] === '[';
    if (isArbitraryVariant) {
      sortedModifiers.push(...unsortedModifiers.sort(), modifier);
      unsortedModifiers = [];
    } else {
      unsortedModifiers.push(modifier);
    }
  });
  sortedModifiers.push(...unsortedModifiers.sort());
  return sortedModifiers;
};
const createConfigUtils = config => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds
  } = configUtils;
  /**
   * Set of classGroupIds in following format:
   * `{importantModifier}{variantModifiers}{classGroupId}`
   * @example 'float'
   * @example 'hover:focus:bg-color'
   * @example 'md:!pr'
   */
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = '';
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    let hasPostfixModifier = Boolean(maybePostfixModifierPosition);
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = sortModifiers(modifiers).join(':');
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.includes(classId)) {
      // Tailwind class omitted due to conflict
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    // Tailwind class not in conflict
    result = originalClassName + (result.length > 0 ? ' ' + result : result);
  }
  return result;
};

/**
 * The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
 *
 * Specifically:
 * - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
 * - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
 *
 * Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
 */
function twJoin() {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = '';
  while (index < arguments.length) {
    if (argument = arguments[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
}
const toValue = mix => {
  if (typeof mix === 'string') {
    return mix;
  }
  let resolvedValue;
  let string = '';
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
};
function createTailwindMerge(createConfigFirst, ...createConfigRest) {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall = initTailwindMerge;
  function initTailwindMerge(classList) {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  }
  function tailwindMerge(classList) {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  }
  return function callTailwindMerge() {
    return functionToCall(twJoin.apply(null, arguments));
  };
}
const fromTheme = key => {
  const themeGetter = theme => theme[key] || [];
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:([a-z-]+):)?(.+)\]$/i;
const fractionRegex = /^\d+\/\d+$/;
const stringLengths = /*#__PURE__*/new Set(['px', 'full', 'screen']);
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch))\(.+\)$/;
// Shadow always begins with x and y offset separated by underscore optionally prepended by inset
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isLength = value => isNumber(value) || stringLengths.has(value) || fractionRegex.test(value);
const isArbitraryLength = value => getIsArbitraryValue(value, 'length', isLengthOnly);
const isNumber = value => Boolean(value) && !Number.isNaN(Number(value));
const isArbitraryNumber = value => getIsArbitraryValue(value, 'number', isNumber);
const isInteger = value => Boolean(value) && Number.isInteger(Number(value));
const isPercent = value => value.endsWith('%') && isNumber(value.slice(0, -1));
const isArbitraryValue = value => arbitraryValueRegex.test(value);
const isTshirtSize = value => tshirtUnitRegex.test(value);
const sizeLabels = /*#__PURE__*/new Set(['length', 'size', 'percentage']);
const isArbitrarySize = value => getIsArbitraryValue(value, sizeLabels, isNever);
const isArbitraryPosition = value => getIsArbitraryValue(value, 'position', isNever);
const imageLabels = /*#__PURE__*/new Set(['image', 'url']);
const isArbitraryImage = value => getIsArbitraryValue(value, imageLabels, isImage);
const isArbitraryShadow = value => getIsArbitraryValue(value, '', isShadow);
const isAny = () => true;
const getIsArbitraryValue = (value, label, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return typeof label === 'string' ? result[1] === label : label.has(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const isLengthOnly = value =>
// `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
// For example, `hsl(0 0% 0%)` would be classified as a length without this check.
// I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
const isNever = () => false;
const isShadow = value => shadowRegex.test(value);
const isImage = value => imageRegex.test(value);
const validators = /*#__PURE__*/Object.defineProperty({
  __proto__: null,
  isAny,
  isArbitraryImage,
  isArbitraryLength,
  isArbitraryNumber,
  isArbitraryPosition,
  isArbitraryShadow,
  isArbitrarySize,
  isArbitraryValue,
  isInteger,
  isLength,
  isNumber,
  isPercent,
  isTshirtSize
}, Symbol.toStringTag, {
  value: 'Module'
});
const getDefaultConfig = () => {
  const colors = fromTheme('colors');
  const spacing = fromTheme('spacing');
  const blur = fromTheme('blur');
  const brightness = fromTheme('brightness');
  const borderColor = fromTheme('borderColor');
  const borderRadius = fromTheme('borderRadius');
  const borderSpacing = fromTheme('borderSpacing');
  const borderWidth = fromTheme('borderWidth');
  const contrast = fromTheme('contrast');
  const grayscale = fromTheme('grayscale');
  const hueRotate = fromTheme('hueRotate');
  const invert = fromTheme('invert');
  const gap = fromTheme('gap');
  const gradientColorStops = fromTheme('gradientColorStops');
  const gradientColorStopPositions = fromTheme('gradientColorStopPositions');
  const inset = fromTheme('inset');
  const margin = fromTheme('margin');
  const opacity = fromTheme('opacity');
  const padding = fromTheme('padding');
  const saturate = fromTheme('saturate');
  const scale = fromTheme('scale');
  const sepia = fromTheme('sepia');
  const skew = fromTheme('skew');
  const space = fromTheme('space');
  const translate = fromTheme('translate');
  const getOverscroll = () => ['auto', 'contain', 'none'];
  const getOverflow = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'];
  const getSpacingWithAutoAndArbitrary = () => ['auto', isArbitraryValue, spacing];
  const getSpacingWithArbitrary = () => [isArbitraryValue, spacing];
  const getLengthWithEmptyAndArbitrary = () => ['', isLength, isArbitraryLength];
  const getNumberWithAutoAndArbitrary = () => ['auto', isNumber, isArbitraryValue];
  const getPositions = () => ['bottom', 'center', 'left', 'left-bottom', 'left-top', 'right', 'right-bottom', 'right-top', 'top'];
  const getLineStyles = () => ['solid', 'dashed', 'dotted', 'double', 'none'];
  const getBlendModes = () => ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
  const getAlign = () => ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch'];
  const getZeroAndEmpty = () => ['', '0', isArbitraryValue];
  const getBreaks = () => ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'];
  const getNumberAndArbitrary = () => [isNumber, isArbitraryValue];
  return {
    cacheSize: 500,
    separator: ':',
    theme: {
      colors: [isAny],
      spacing: [isLength, isArbitraryLength],
      blur: ['none', '', isTshirtSize, isArbitraryValue],
      brightness: getNumberAndArbitrary(),
      borderColor: [colors],
      borderRadius: ['none', '', 'full', isTshirtSize, isArbitraryValue],
      borderSpacing: getSpacingWithArbitrary(),
      borderWidth: getLengthWithEmptyAndArbitrary(),
      contrast: getNumberAndArbitrary(),
      grayscale: getZeroAndEmpty(),
      hueRotate: getNumberAndArbitrary(),
      invert: getZeroAndEmpty(),
      gap: getSpacingWithArbitrary(),
      gradientColorStops: [colors],
      gradientColorStopPositions: [isPercent, isArbitraryLength],
      inset: getSpacingWithAutoAndArbitrary(),
      margin: getSpacingWithAutoAndArbitrary(),
      opacity: getNumberAndArbitrary(),
      padding: getSpacingWithArbitrary(),
      saturate: getNumberAndArbitrary(),
      scale: getNumberAndArbitrary(),
      sepia: getZeroAndEmpty(),
      skew: getNumberAndArbitrary(),
      space: getSpacingWithArbitrary(),
      translate: getSpacingWithArbitrary()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ['auto', 'square', 'video', isArbitraryValue]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       */
      container: ['container'],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isTshirtSize]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      'break-after': [{
        'break-after': getBreaks()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      'break-before': [{
        'break-before': getBreaks()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      'break-inside': [{
        'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column']
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      'box-decoration': [{
        'box-decoration': ['slice', 'clone']
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ['border', 'content']
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden'],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ['right', 'left', 'none', 'start', 'end']
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ['left', 'right', 'both', 'none', 'start', 'end']
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ['isolate', 'isolation-auto'],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      'object-fit': [{
        object: ['contain', 'cover', 'fill', 'none', 'scale-down']
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      'object-position': [{
        object: [...getPositions(), isArbitraryValue]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: getOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-x': [{
        'overflow-x': getOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-y': [{
        'overflow-y': getOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: getOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-x': [{
        'overscroll-x': getOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-y': [{
        'overscroll-y': getOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: [inset]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-x': [{
        'inset-x': [inset]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-y': [{
        'inset-y': [inset]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [inset]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [inset]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [inset]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [inset]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [inset]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [inset]
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ['visible', 'invisible', 'collapse'],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: ['auto', isInteger, isArbitraryValue]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: getSpacingWithAutoAndArbitrary()
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      'flex-direction': [{
        flex: ['row', 'row-reverse', 'col', 'col-reverse']
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      'flex-wrap': [{
        flex: ['wrap', 'wrap-reverse', 'nowrap']
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: ['1', 'auto', 'initial', 'none', isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: getZeroAndEmpty()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: getZeroAndEmpty()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ['first', 'last', 'none', isInteger, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      'grid-cols': [{
        'grid-cols': [isAny]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start-end': [{
        col: ['auto', {
          span: ['full', isInteger, isArbitraryValue]
        }, isArbitraryValue]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start': [{
        'col-start': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-end': [{
        'col-end': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      'grid-rows': [{
        'grid-rows': [isAny]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start-end': [{
        row: ['auto', {
          span: [isInteger, isArbitraryValue]
        }, isArbitraryValue]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start': [{
        'row-start': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-end': [{
        'row-end': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      'grid-flow': [{
        'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense']
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      'auto-cols': [{
        'auto-cols': ['auto', 'min', 'max', 'fr', isArbitraryValue]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      'auto-rows': [{
        'auto-rows': ['auto', 'min', 'max', 'fr', isArbitraryValue]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [gap]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-x': [{
        'gap-x': [gap]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-y': [{
        'gap-y': [gap]
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      'justify-content': [{
        justify: ['normal', ...getAlign()]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      'justify-items': [{
        'justify-items': ['start', 'end', 'center', 'stretch']
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      'justify-self': [{
        'justify-self': ['auto', 'start', 'end', 'center', 'stretch']
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      'align-content': [{
        content: ['normal', ...getAlign(), 'baseline']
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      'align-items': [{
        items: ['start', 'end', 'center', 'baseline', 'stretch']
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      'align-self': [{
        self: ['auto', 'start', 'end', 'center', 'stretch', 'baseline']
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      'place-content': [{
        'place-content': [...getAlign(), 'baseline']
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      'place-items': [{
        'place-items': ['start', 'end', 'center', 'baseline', 'stretch']
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      'place-self': [{
        'place-self': ['auto', 'start', 'end', 'center', 'stretch']
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: [padding]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [padding]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [padding]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [padding]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [padding]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [padding]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [padding]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [padding]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [padding]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [margin]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [margin]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [margin]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [margin]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [margin]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [margin]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [margin]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [margin]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [margin]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      'space-x': [{
        'space-x': [space]
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/space
       */
      'space-x-reverse': ['space-x-reverse'],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/space
       */
      'space-y': [{
        'space-y': [space]
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/space
       */
      'space-y-reverse': ['space-y-reverse'],
      // Sizing
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: ['auto', 'min', 'max', 'fit', 'svw', 'lvw', 'dvw', isArbitraryValue, spacing]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      'min-w': [{
        'min-w': [isArbitraryValue, spacing, 'min', 'max', 'fit']
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      'max-w': [{
        'max-w': [isArbitraryValue, spacing, 'none', 'full', 'min', 'max', 'fit', 'prose', {
          screen: [isTshirtSize]
        }, isTshirtSize]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [isArbitraryValue, spacing, 'auto', 'min', 'max', 'fit', 'svh', 'lvh', 'dvh']
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      'min-h': [{
        'min-h': [isArbitraryValue, spacing, 'min', 'max', 'fit', 'svh', 'lvh', 'dvh']
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      'max-h': [{
        'max-h': [isArbitraryValue, spacing, 'min', 'max', 'fit', 'svh', 'lvh', 'dvh']
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [isArbitraryValue, spacing, 'auto', 'min', 'max', 'fit']
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      'font-size': [{
        text: ['base', isTshirtSize, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      'font-smoothing': ['antialiased', 'subpixel-antialiased'],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      'font-style': ['italic', 'not-italic'],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      'font-weight': [{
        font: ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black', isArbitraryNumber]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      'font-family': [{
        font: [isAny]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-normal': ['normal-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-ordinal': ['ordinal'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-slashed-zero': ['slashed-zero'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-figure': ['lining-nums', 'oldstyle-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-spacing': ['proportional-nums', 'tabular-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest', isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      'line-clamp': [{
        'line-clamp': ['none', isNumber, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose', isLength, isArbitraryValue]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      'list-image': [{
        'list-image': ['none', isArbitraryValue]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      'list-style-type': [{
        list: ['none', 'disc', 'decimal', isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      'list-style-position': [{
        list: ['inside', 'outside']
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/placeholder-color
       */
      'placeholder-color': [{
        placeholder: [colors]
      }],
      /**
       * Placeholder Opacity
       * @see https://tailwindcss.com/docs/placeholder-opacity
       */
      'placeholder-opacity': [{
        'placeholder-opacity': [opacity]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      'text-alignment': [{
        text: ['left', 'center', 'right', 'justify', 'start', 'end']
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      'text-color': [{
        text: [colors]
      }],
      /**
       * Text Opacity
       * @see https://tailwindcss.com/docs/text-opacity
       */
      'text-opacity': [{
        'text-opacity': [opacity]
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      'text-decoration-style': [{
        decoration: [...getLineStyles(), 'wavy']
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      'text-decoration-thickness': [{
        decoration: ['auto', 'from-font', isLength, isArbitraryLength]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      'underline-offset': [{
        'underline-offset': ['auto', isLength, isArbitraryValue]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      'text-decoration-color': [{
        decoration: [colors]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      'text-wrap': [{
        text: ['wrap', 'nowrap', 'balance', 'pretty']
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: getSpacingWithArbitrary()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      'vertical-align': [{
        align: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super', isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces']
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ['normal', 'words', 'all', 'keep']
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ['none', 'manual', 'auto']
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ['none', isArbitraryValue]
      }],
      // Backgrounds
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      'bg-attachment': [{
        bg: ['fixed', 'local', 'scroll']
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      'bg-clip': [{
        'bg-clip': ['border', 'padding', 'content', 'text']
      }],
      /**
       * Background Opacity
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/background-opacity
       */
      'bg-opacity': [{
        'bg-opacity': [opacity]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      'bg-origin': [{
        'bg-origin': ['border', 'padding', 'content']
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      'bg-position': [{
        bg: [...getPositions(), isArbitraryPosition]
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      'bg-repeat': [{
        bg: ['no-repeat', {
          repeat: ['', 'x', 'y', 'round', 'space']
        }]
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      'bg-size': [{
        bg: ['auto', 'cover', 'contain', isArbitrarySize]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      'bg-image': [{
        bg: ['none', {
          'gradient-to': ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl']
        }, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      'bg-color': [{
        bg: [colors]
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from-pos': [{
        from: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via-pos': [{
        via: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to-pos': [{
        to: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from': [{
        from: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via': [{
        via: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to': [{
        to: [gradientColorStops]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [borderRadius]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-s': [{
        'rounded-s': [borderRadius]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-e': [{
        'rounded-e': [borderRadius]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-t': [{
        'rounded-t': [borderRadius]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-r': [{
        'rounded-r': [borderRadius]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-b': [{
        'rounded-b': [borderRadius]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-l': [{
        'rounded-l': [borderRadius]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ss': [{
        'rounded-ss': [borderRadius]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-se': [{
        'rounded-se': [borderRadius]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ee': [{
        'rounded-ee': [borderRadius]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-es': [{
        'rounded-es': [borderRadius]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tl': [{
        'rounded-tl': [borderRadius]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tr': [{
        'rounded-tr': [borderRadius]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-br': [{
        'rounded-br': [borderRadius]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-bl': [{
        'rounded-bl': [borderRadius]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w': [{
        border: [borderWidth]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-x': [{
        'border-x': [borderWidth]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-y': [{
        'border-y': [borderWidth]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-s': [{
        'border-s': [borderWidth]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-e': [{
        'border-e': [borderWidth]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-t': [{
        'border-t': [borderWidth]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-r': [{
        'border-r': [borderWidth]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-b': [{
        'border-b': [borderWidth]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-l': [{
        'border-l': [borderWidth]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      'border-opacity': [{
        'border-opacity': [opacity]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      'border-style': [{
        border: [...getLineStyles(), 'hidden']
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-x': [{
        'divide-x': [borderWidth]
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-x-reverse': ['divide-x-reverse'],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-y': [{
        'divide-y': [borderWidth]
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-y-reverse': ['divide-y-reverse'],
      /**
       * Divide Opacity
       * @see https://tailwindcss.com/docs/divide-opacity
       */
      'divide-opacity': [{
        'divide-opacity': [opacity]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      'divide-style': [{
        divide: getLineStyles()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color': [{
        border: [borderColor]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-x': [{
        'border-x': [borderColor]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-y': [{
        'border-y': [borderColor]
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-s': [{
        'border-s': [borderColor]
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-e': [{
        'border-e': [borderColor]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-t': [{
        'border-t': [borderColor]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-r': [{
        'border-r': [borderColor]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-b': [{
        'border-b': [borderColor]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-l': [{
        'border-l': [borderColor]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      'divide-color': [{
        divide: [borderColor]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      'outline-style': [{
        outline: ['', ...getLineStyles()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      'outline-offset': [{
        'outline-offset': [isLength, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      'outline-w': [{
        outline: [isLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      'outline-color': [{
        outline: [colors]
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      'ring-w': [{
        ring: getLengthWithEmptyAndArbitrary()
      }],
      /**
       * Ring Width Inset
       * @see https://tailwindcss.com/docs/ring-width
       */
      'ring-w-inset': ['ring-inset'],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/ring-color
       */
      'ring-color': [{
        ring: [colors]
      }],
      /**
       * Ring Opacity
       * @see https://tailwindcss.com/docs/ring-opacity
       */
      'ring-opacity': [{
        'ring-opacity': [opacity]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      'ring-offset-w': [{
        'ring-offset': [isLength, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      'ring-offset-color': [{
        'ring-offset': [colors]
      }],
      // Effects
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: ['', 'inner', 'none', isTshirtSize, isArbitraryShadow]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      'shadow-color': [{
        shadow: [isAny]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [opacity]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      'mix-blend': [{
        'mix-blend': [...getBlendModes(), 'plus-lighter', 'plus-darker']
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      'bg-blend': [{
        'bg-blend': getBlendModes()
      }],
      // Filters
      /**
       * Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: ['', 'none']
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: [blur]
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [brightness]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [contrast]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      'drop-shadow': [{
        'drop-shadow': ['', 'none', isTshirtSize, isArbitraryValue]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [grayscale]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      'hue-rotate': [{
        'hue-rotate': [hueRotate]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [invert]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [saturate]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [sepia]
      }],
      /**
       * Backdrop Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      'backdrop-filter': [{
        'backdrop-filter': ['', 'none']
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      'backdrop-blur': [{
        'backdrop-blur': [blur]
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      'backdrop-brightness': [{
        'backdrop-brightness': [brightness]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      'backdrop-contrast': [{
        'backdrop-contrast': [contrast]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      'backdrop-grayscale': [{
        'backdrop-grayscale': [grayscale]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      'backdrop-hue-rotate': [{
        'backdrop-hue-rotate': [hueRotate]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      'backdrop-invert': [{
        'backdrop-invert': [invert]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      'backdrop-opacity': [{
        'backdrop-opacity': [opacity]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      'backdrop-saturate': [{
        'backdrop-saturate': [saturate]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      'backdrop-sepia': [{
        'backdrop-sepia': [sepia]
      }],
      // Tables
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      'border-collapse': [{
        border: ['collapse', 'separate']
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing': [{
        'border-spacing': [borderSpacing]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-x': [{
        'border-spacing-x': [borderSpacing]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-y': [{
        'border-spacing-y': [borderSpacing]
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      'table-layout': [{
        table: ['auto', 'fixed']
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ['top', 'bottom']
      }],
      // Transitions and Animation
      /**
       * Tranisition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ['none', 'all', '', 'colors', 'opacity', 'shadow', 'transform', isArbitraryValue]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: getNumberAndArbitrary()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ['linear', 'in', 'out', 'in-out', isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: getNumberAndArbitrary()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ['none', 'spin', 'ping', 'pulse', 'bounce', isArbitraryValue]
      }],
      // Transforms
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: ['', 'gpu', 'none']
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: [scale]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-x': [{
        'scale-x': [scale]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-y': [{
        'scale-y': [scale]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [isInteger, isArbitraryValue]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-x': [{
        'translate-x': [translate]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-y': [{
        'translate-y': [translate]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-x': [{
        'skew-x': [skew]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-y': [{
        'skew-y': [skew]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      'transform-origin': [{
        origin: ['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left', isArbitraryValue]
      }],
      // Interactivity
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: ['auto', colors]
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ['none', 'auto']
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out', isArbitraryValue]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      'caret-color': [{
        caret: [colors]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      'pointer-events': [{
        'pointer-events': ['none', 'auto']
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ['none', 'y', 'x', '']
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      'scroll-behavior': [{
        scroll: ['auto', 'smooth']
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-m': [{
        'scroll-m': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mx': [{
        'scroll-mx': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-my': [{
        'scroll-my': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ms': [{
        'scroll-ms': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-me': [{
        'scroll-me': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mt': [{
        'scroll-mt': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mr': [{
        'scroll-mr': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mb': [{
        'scroll-mb': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ml': [{
        'scroll-ml': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-p': [{
        'scroll-p': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-px': [{
        'scroll-px': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-py': [{
        'scroll-py': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-ps': [{
        'scroll-ps': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pe': [{
        'scroll-pe': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pt': [{
        'scroll-pt': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pr': [{
        'scroll-pr': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pb': [{
        'scroll-pb': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pl': [{
        'scroll-pl': getSpacingWithArbitrary()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      'snap-align': [{
        snap: ['start', 'end', 'center', 'align-none']
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      'snap-stop': [{
        snap: ['normal', 'always']
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-type': [{
        snap: ['none', 'x', 'y', 'both']
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-strictness': [{
        snap: ['mandatory', 'proximity']
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ['auto', 'none', 'manipulation']
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-x': [{
        'touch-pan': ['x', 'left', 'right']
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-y': [{
        'touch-pan': ['y', 'up', 'down']
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-pz': ['touch-pinch-zoom'],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ['none', 'text', 'all', 'auto']
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      'will-change': [{
        'will-change': ['auto', 'scroll', 'contents', 'transform', isArbitraryValue]
      }],
      // SVG
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: [colors, 'none']
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      'stroke-w': [{
        stroke: [isLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: [colors, 'none']
      }],
      // Accessibility
      /**
       * Screen Readers
       * @see https://tailwindcss.com/docs/screen-readers
       */
      sr: ['sr-only', 'not-sr-only'],
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      'forced-color-adjust': [{
        'forced-color-adjust': ['auto', 'none']
      }]
    },
    conflictingClassGroups: {
      overflow: ['overflow-x', 'overflow-y'],
      overscroll: ['overscroll-x', 'overscroll-y'],
      inset: ['inset-x', 'inset-y', 'start', 'end', 'top', 'right', 'bottom', 'left'],
      'inset-x': ['right', 'left'],
      'inset-y': ['top', 'bottom'],
      flex: ['basis', 'grow', 'shrink'],
      gap: ['gap-x', 'gap-y'],
      p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
      px: ['pr', 'pl'],
      py: ['pt', 'pb'],
      m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
      mx: ['mr', 'ml'],
      my: ['mt', 'mb'],
      size: ['w', 'h'],
      'font-size': ['leading'],
      'fvn-normal': ['fvn-ordinal', 'fvn-slashed-zero', 'fvn-figure', 'fvn-spacing', 'fvn-fraction'],
      'fvn-ordinal': ['fvn-normal'],
      'fvn-slashed-zero': ['fvn-normal'],
      'fvn-figure': ['fvn-normal'],
      'fvn-spacing': ['fvn-normal'],
      'fvn-fraction': ['fvn-normal'],
      'line-clamp': ['display', 'overflow'],
      rounded: ['rounded-s', 'rounded-e', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-ss', 'rounded-se', 'rounded-ee', 'rounded-es', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl'],
      'rounded-s': ['rounded-ss', 'rounded-es'],
      'rounded-e': ['rounded-se', 'rounded-ee'],
      'rounded-t': ['rounded-tl', 'rounded-tr'],
      'rounded-r': ['rounded-tr', 'rounded-br'],
      'rounded-b': ['rounded-br', 'rounded-bl'],
      'rounded-l': ['rounded-tl', 'rounded-bl'],
      'border-spacing': ['border-spacing-x', 'border-spacing-y'],
      'border-w': ['border-w-s', 'border-w-e', 'border-w-t', 'border-w-r', 'border-w-b', 'border-w-l'],
      'border-w-x': ['border-w-r', 'border-w-l'],
      'border-w-y': ['border-w-t', 'border-w-b'],
      'border-color': ['border-color-s', 'border-color-e', 'border-color-t', 'border-color-r', 'border-color-b', 'border-color-l'],
      'border-color-x': ['border-color-r', 'border-color-l'],
      'border-color-y': ['border-color-t', 'border-color-b'],
      'scroll-m': ['scroll-mx', 'scroll-my', 'scroll-ms', 'scroll-me', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml'],
      'scroll-mx': ['scroll-mr', 'scroll-ml'],
      'scroll-my': ['scroll-mt', 'scroll-mb'],
      'scroll-p': ['scroll-px', 'scroll-py', 'scroll-ps', 'scroll-pe', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl'],
      'scroll-px': ['scroll-pr', 'scroll-pl'],
      'scroll-py': ['scroll-pt', 'scroll-pb'],
      touch: ['touch-x', 'touch-y', 'touch-pz'],
      'touch-x': ['touch'],
      'touch-y': ['touch'],
      'touch-pz': ['touch']
    },
    conflictingClassGroupModifiers: {
      'font-size': ['leading']
    }
  };
};

/**
 * @param baseConfig Config where other config will be merged into. This object will be mutated.
 * @param configExtension Partial config to merge into the `baseConfig`.
 */
const mergeConfigs = (baseConfig, {
  cacheSize,
  prefix,
  separator,
  experimentalParseClassName,
  extend = {},
  override = {}
}) => {
  overrideProperty(baseConfig, 'cacheSize', cacheSize);
  overrideProperty(baseConfig, 'prefix', prefix);
  overrideProperty(baseConfig, 'separator', separator);
  overrideProperty(baseConfig, 'experimentalParseClassName', experimentalParseClassName);
  for (const configKey in override) {
    overrideConfigProperties(baseConfig[configKey], override[configKey]);
  }
  for (const key in extend) {
    mergeConfigProperties(baseConfig[key], extend[key]);
  }
  return baseConfig;
};
const overrideProperty = (baseObject, overrideKey, overrideValue) => {
  if (overrideValue !== undefined) {
    baseObject[overrideKey] = overrideValue;
  }
};
const overrideConfigProperties = (baseObject, overrideObject) => {
  if (overrideObject) {
    for (const key in overrideObject) {
      overrideProperty(baseObject, key, overrideObject[key]);
    }
  }
};
const mergeConfigProperties = (baseObject, mergeObject) => {
  if (mergeObject) {
    for (const key in mergeObject) {
      const mergeValue = mergeObject[key];
      if (mergeValue !== undefined) {
        baseObject[key] = (baseObject[key] || []).concat(mergeValue);
      }
    }
  }
};
const extendTailwindMerge = (configExtension, ...createConfig) => typeof configExtension === 'function' ? createTailwindMerge(getDefaultConfig, configExtension, ...createConfig) : createTailwindMerge(() => mergeConfigs(getDefaultConfig(), configExtension), ...createConfig);
const twMerge = /*#__PURE__*/createTailwindMerge(getDefaultConfig);

//# sourceMappingURL=bundle-mjs.mjs.map


/***/ }),

/***/ "./src/modules/animation-builder/components/common/AnimationStructure.jsx":
/*!********************************************************************************!*\
  !*** ./src/modules/animation-builder/components/common/AnimationStructure.jsx ***!
  \********************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ AnimationStructure; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lib_animStructure__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/animStructure */ "./src/modules/animation-builder/lib/animStructure.js");
/* harmony import */ var _components_ui_tabs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/ui/tabs */ "./src/modules/animation-builder/components/ui/tabs.jsx");
/* harmony import */ var _ui_button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ui/button */ "./src/modules/animation-builder/components/ui/button.jsx");
/* harmony import */ var _lib_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/lib/icons */ "./src/modules/animation-builder/lib/icons.jsx");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/search-x.js");
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! lucide-react */ "./node_modules/lucide-react/dist/esm/icons/search.js");
/* harmony import */ var _ui_input__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../ui/input */ "./src/modules/animation-builder/components/ui/input.jsx");
/* harmony import */ var _ui_accordion__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../ui/accordion */ "./src/modules/animation-builder/components/ui/accordion.jsx");
/* harmony import */ var _ui_scroll_area__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../ui/scroll-area */ "./src/modules/animation-builder/components/ui/scroll-area.jsx");
/* harmony import */ var _notFound_STAnimNotFound__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../notFound/STAnimNotFound */ "./src/modules/animation-builder/components/notFound/STAnimNotFound.jsx");
/* harmony import */ var _notFound_SeAnimNotFound__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../notFound/SeAnimNotFound */ "./src/modules/animation-builder/components/notFound/SeAnimNotFound.jsx");












function AnimationStructure() {
  const [offPanel, setOffPanel] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [showBorder, setShowBorder] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [containers, setContainers] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [bContainers, setBContainers] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [position, setPosition] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    left: 20,
    top: 60
  });
  const [size, setSize] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    width: 263,
    height: 460
  });
  const [gsapFound, setGsapFound] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [tabValue, setTabValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("builder");
  const [isOpenSearch, setIsOpenSearch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [searchText, setSearchText] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
  const [hoveredAnimation, setHoveredAnimation] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const panelRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const draggingRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
  const resizingRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
  const pointerStart = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
    x: 0,
    y: 0
  });
  const startPos = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
    left: 0,
    top: 0
  });
  const startSize = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
    width: 0,
    height: 0
  });
  const scanAttemptsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(0);
  const scanTimeoutRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const maxAttempts = 6;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Effect for showing borders on hover
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (hoveredAnimation) {
      (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.addOutlinesToAnimatedElements)([hoveredAnimation]);
    } else if (showBorder) {
      (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.addOutlinesToAnimatedElements)([...containers, ...bContainers]);
    } else {
      (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.removeOutlinesFromElements)([...containers, ...bContainers]);
    }
    return () => {
      if (hoveredAnimation) {
        (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.removeOutlinesFromElements)([hoveredAnimation]);
      }
    };
  }, [hoveredAnimation, showBorder, containers, bContainers]);

  // Drag & resize effects
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    function onPointerMove(e) {
      if (draggingRef.current) {
        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;
        setPosition({
          left: clamp(startPos.current.left + dx, 0, window.innerWidth - startSize.current.width),
          top: clamp(startPos.current.top + dy, 0, window.innerHeight - startSize.current.height)
        });
      } else if (resizingRef.current) {
        const dy = e.clientY - pointerStart.current.y;
        setSize({
          width: startSize.current.width,
          height: clamp(startSize.current.height + dy, 120, window.innerHeight - position.top)
        });
      }
    }
    function onPointerUp() {
      draggingRef.current = false;
      resizingRef.current = false;
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [position.top]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const attemptScan = () => {
      if (gsapFound || scanAttemptsRef.current >= maxAttempts) {
        return;
      }
      scanAttemptsRef.current++;
      if (scanGSAP()) {
        setGsapFound(true);
      } else if (scanAttemptsRef.current < maxAttempts) scanTimeoutRef.current = setTimeout(attemptScan, scanAttemptsRef.current <= 3 ? 200 : scanAttemptsRef.current * 800);
    };
    scanTimeoutRef.current = setTimeout(attemptScan, 50);
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.removeOutlinesFromElements)();
    };
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    // Initial load
    wcf_anim_preview_object?.animation_config?.desktop?.forEach(mainAnim => {
      if (mainAnim?.type === "custom") {
        mainAnim?.animations?.forEach(anim => addElementByClassName(anim?.applyAnimation?.className, mainAnim.id, mainAnim.title));
      } else if (mainAnim?.type === "preset") {
        addElementByClassName(mainAnim?.itemClass, mainAnim.id, mainAnim.title);
      }
    });
    const structure = localStorage.getItem("aae_selected_structure");
    if (structure) {
      const parsed = structure === "true";
      setOffPanel(parsed);
    }
    const border = localStorage.getItem("aae_selected_border");
    if (border) {
      const parsed = border === "true";
      setShowBorder(parsed);
    }
    const handleMessage = event => {
      if (event?.data?.["wcf-animation-config"]) {
        setBContainers([]); // Reset first
        // Use setTimeout to ensure reset completes
        setTimeout(() => {
          event?.data?.["wcf-animation-config"]?.desktop?.forEach(mainAnim => {
            if (mainAnim?.type === "custom") {
              mainAnim?.animations?.forEach(anim => addElementByClassName(anim?.applyAnimation?.className, mainAnim.id, mainAnim.title));
            } else if (mainAnim?.type === "preset") {
              addElementByClassName(mainAnim?.itemClass, mainAnim.id, mainAnim.title);
            }
          });
        }, 0);
      } else if (event?.data?.["wcf-animation-config-reset"]) {
        setBContainers([]);
        setTimeout(() => {
          wcf_anim_preview_object?.animation_config?.desktop?.forEach(mainAnim => {
            if (mainAnim?.type === "custom") {
              mainAnim?.animations?.forEach(anim => addElementByClassName(anim?.applyAnimation?.className, mainAnim.id, mainAnim.title));
            } else if (mainAnim?.type === "preset") {
              addElementByClassName(mainAnim?.itemClass, mainAnim.id, mainAnim.title);
            }
          });
        }, 0);
      }
      if (event?.data?.["aae_show_structure"] !== undefined) {
        setOffPanel(event?.data?.["aae_show_structure"]);
      }
      if (event?.data?.["aae_show_border"] !== undefined) {
        setShowBorder(event?.data?.["aae_show_border"]);
      }
    };
    window.addEventListener("message", handleMessage, false);
    return () => window.removeEventListener("message", handleMessage, false);
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const handleClick = e => {
      // Find the closest element with your class
      const btn = e.target.closest(".ab-setting-action");
      const copyBtn = e.target.closest(".ab-copy-action");

      // --- Handle copy action ---
      if (copyBtn) {
        const text = copyBtn.getAttribute("data-selector-copy");
        if (text) {
          // fallback copy using a hidden textarea (no flash / no layout shift)
          const copyWithFallback = text => {
            const textarea = document.createElement("textarea");
            textarea.value = text;

            // Prevent mobile keyboard and keep it invisible/offscreen
            textarea.setAttribute("readonly", "");
            textarea.setAttribute("aria-hidden", "true");
            textarea.style.position = "fixed"; // avoid scrolling to it
            textarea.style.left = "-9999px"; // fully off-screen
            textarea.style.top = "0";
            textarea.style.opacity = "0";
            textarea.style.pointerEvents = "none";
            document.body.appendChild(textarea);

            // select text (works for desktop + mobile)
            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
            let success = false;
            try {
              success = document.execCommand("copy"); // <-- actually copies to clipboard
            } catch (err) {
              success = false;
            }
            document.body.removeChild(textarea);
            return success;
          };

          // main copy function (prefers Clipboard API)
          const doCopy = async text => {
            if (navigator.clipboard && window.isSecureContext && navigator.clipboard.writeText) {
              try {
                await navigator.clipboard.writeText(text);
                return true;
              } catch (err) {
                return copyWithFallback(text);
              }
            } else {
              return copyWithFallback(text);
            }
          };

          // perform copy and give feedback
          doCopy(text).then(ok => {
            copyBtn.classList.add("zoom-effect");
            setTimeout(() => copyBtn.classList.remove("zoom-effect"), 200);
            const prevBg = copyBtn.style.background;
            copyBtn.style.background = "#55B2FF";
            setTimeout(() => {
              copyBtn.style.background = prevBg || "#6C6C6C";
            }, 1500);
          });
        }
        return;
      }
      if (!btn) return;
      const selector = btn.getAttribute("data-selector-target");
      const tab = btn.getAttribute("data-selector-tab");
      const aId = btn.getAttribute("data-selector-aid");
      if (aId) {
        window.parent.postMessage({
          type: "PANEL_ANIMATION_LIST_BUILDER",
          payload: {
            id: aId
          }
        }, "*");
      }
      if (tab) {
        setTabValue(tab);
      }
      if (selector) {
        (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.scrollToElementByData)("selector-list", selector);
      }
    };

    // Attach one handler for all buttons
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // Drag & resize handlers
  const onHeaderPointerDown = e => {
    e.preventDefault();
    draggingRef.current = true;
    pointerStart.current = {
      x: e.clientX,
      y: e.clientY
    };
    startPos.current = {
      ...position
    };
    startSize.current = {
      ...size
    };
    panelRef.current?.setPointerCapture?.(e.pointerId);
  };
  const onResizePointerDown = e => {
    e.preventDefault();
    resizingRef.current = true;
    pointerStart.current = {
      x: e.clientX,
      y: e.clientY
    };
    startSize.current = {
      ...size
    };
    startPos.current = {
      ...position
    };
    panelRef.current?.setPointerCapture?.(e.pointerId);
  };

  // Scan GSAP animations + inline transforms
  const scanGSAP = () => {
    const animations = [...containers];
    const seenSelectors = new Set(animations.map(a => a.selector));
    const counterRef = {
      current: animations.length + 1
    };
    try {
      const uniqueTargets = new Set();
      if (window.gsap) {
        const children = window.gsap.globalTimeline.getChildren(true, true, true);
        children.forEach(tween => {
          let targets = [];
          if (typeof tween.targets === "function") {
            targets = tween.targets();
          } else if (Array.isArray(tween.targets)) {
            targets = tween.targets;
          } else if (Array.isArray(tween._targets)) {
            targets = tween._targets;
          }
          targets.forEach(el => {
            if (el && el.nodeType === 1 && (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.isLikelyAnimatedTarget)(el)) {
              // use aria-label ancestor if available
              const ariaAncestor = el.closest?.("[aria-label]");
              uniqueTargets.add(ariaAncestor || el);
            }
          });
        });
      }

      // also check inline styled elements
      document.querySelectorAll('[style*="transform"], [style*="translate"], [style*="matrix"], [style*="opacity"]').forEach(el => {
        if ((0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.isLikelyAnimatedTarget)(el)) {
          const ariaAncestor = el.closest?.("[aria-label]");
          uniqueTargets.add(ariaAncestor || el);
        }
      });

      // now process each unique element once
      uniqueTargets.forEach(el => (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.addElementToAnimations)({
        el,
        animations,
        seenSelectors,
        counterRef,
        context: "Animation"
      }));
    } catch (e) {
      console.warn("GSAP scan error:", e);
    }
    setContainers(animations);
    return animations.length > 0;
  };
  const addElementByClassName = (className, aId, aTitle) => {
    const el = document.querySelector(className);
    if (!el) {
      console.warn(`No element found with class "${className}"`);
      return;
    }

    // Use functional update to get the latest state
    setBContainers(prevBContainers => {
      const animations = [...prevBContainers];
      const seenSelectors = new Set(animations.map(a => a.selector));
      const counterRef = {
        current: animations.length + 1
      };
      (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.addElementToAnimations)({
        el,
        animations,
        seenSelectors,
        counterRef,
        animType: "builder",
        aId,
        aTitle
      });
      return animations;
    });
  };
  const getFilteredContainers = () => {
    if (!searchText.trim()) return bContainers; // nothing typed → return all

    return bContainers.filter(container => container.name.toLowerCase().includes(searchText.toLowerCase()));
  };
  if (!offPanel) return null;
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wcfab2025"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    ref: panelRef,
    className: "fixed bg-background text-text rounded-[10px] flex flex-col overflow-hidden z-[999999] select-auto wcfanimb-skip-selector-full",
    style: {
      left: position.left,
      top: position.top,
      width: size.width,
      height: size.height
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "flex items-center justify-between py-[8px] px-[12px] border-b-[1px] cursor-grab gap-[8px] w-full"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "flex items-center gap-[8px]",
    onPointerDown: onHeaderPointerDown
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
    width: "16",
    height: "16",
    rx: "4",
    fill: "url(#paint0_linear_11001_3964)"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M11.1902 9.65332C11.2074 9.68594 11.2165 9.72289 11.2156 9.75977C11.2146 9.79656 11.2041 9.83264 11.1853 9.86426C11.1664 9.89592 11.1392 9.92211 11.1072 9.94043C11.0752 9.95875 11.0386 9.96849 11.0017 9.96875H8.29956L8.71362 9.76465C8.78952 9.73161 8.85795 9.68325 8.91479 9.62305C8.97163 9.56285 9.01601 9.49175 9.04468 9.41406C9.07334 9.33627 9.08597 9.25273 9.08179 9.16992C9.07757 9.08721 9.05659 9.00606 9.02026 8.93164L8.66089 8.19531C8.64327 8.15903 8.61596 8.12783 8.58179 8.10645C8.54781 8.08529 8.50852 8.07427 8.46851 8.07422H7.24097L8.65503 10.9766C8.67583 11.0188 8.68726 11.0652 8.68726 11.1123C8.68723 11.1594 8.67589 11.2058 8.65503 11.248L7.93433 12.6875L4.58276 6.34668C4.56541 6.31393 4.55637 6.27729 4.55737 6.24023C4.55839 6.20326 4.56958 6.16745 4.58862 6.13574C4.60774 6.10398 4.63448 6.07682 4.66675 6.05859C4.6989 6.0405 4.73533 6.03125 4.77222 6.03125H7.44116L7.05933 6.23633C6.98333 6.26937 6.91408 6.31766 6.85718 6.37793C6.80044 6.43808 6.7569 6.50932 6.72827 6.58691C6.69964 6.66462 6.68702 6.74737 6.69116 6.83008C6.69534 6.91268 6.71551 6.99401 6.75171 7.06836L7.11401 7.81152C7.13166 7.84772 7.15898 7.87906 7.19312 7.90039C7.22729 7.92172 7.2671 7.93267 7.30737 7.93262H8.53394L7.11694 5.02344C7.09637 4.98113 7.08546 4.93475 7.08569 4.8877C7.08596 4.84052 7.09777 4.79413 7.1189 4.75195L7.83862 3.3125L11.1902 9.65332ZM5.35034 9.96875H3.84058C3.81139 9.96866 3.78311 9.9601 3.75854 9.94434C3.73399 9.92855 3.71414 9.90639 3.7019 9.87988C3.68968 9.85324 3.68517 9.82298 3.68921 9.79395C3.69331 9.7651 3.70545 9.73797 3.72437 9.71582L4.64331 8.64453L5.35034 9.96875ZM12.0046 8.8877C12.1747 8.8877 12.3132 9.0257 12.3132 9.19531C12.3131 9.36484 12.1746 9.50195 12.0046 9.50195C11.8348 9.5018 11.6971 9.36475 11.697 9.19531C11.697 9.02579 11.8347 8.88785 12.0046 8.8877ZM11.7742 6.85059C12.0716 6.85059 12.3123 7.092 12.3123 7.38867C12.312 7.68513 12.0714 7.92578 11.7742 7.92578H11.5369C11.2396 7.92575 10.999 7.68511 10.9988 7.38867C10.9988 7.09202 11.2395 6.85062 11.5369 6.85059H11.7742ZM11.7742 4.66504C12.0715 4.66509 12.3123 4.90551 12.3123 5.20215C12.3122 5.49876 12.0715 5.7392 11.7742 5.73926H10.4656C10.1682 5.73926 9.92654 5.4988 9.92651 5.20215C9.92651 4.90548 10.1682 4.66504 10.4656 4.66504H11.7742Z",
    fill: "white"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("linearGradient", {
    id: "paint0_linear_11001_3964",
    x1: "16",
    y1: "0",
    x2: "1.90735e-06",
    y2: "16",
    gradientUnits: "userSpaceOnUse"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("stop", {
    offset: "0.100407",
    "stop-color": "#F12529"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("stop", {
    offset: "0.901072",
    "stop-color": "#FFA030"
  })))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "text-[14px] font-medium"
  }, "Animation "), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "text-[9px] text-[#DADADA]"
  }, "(All ", containers.length + bContainers.length, " Animation)"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_button__WEBPACK_IMPORTED_MODULE_3__.Button, {
    className: "h-[14px] w-[14px] bg-transparent hover:bg-transparent [&_svg]:size-[10px]",
    onClick: () => {
      setOffPanel(false);
      localStorage.setItem("aae_selected_structure", false);
      window.parent.postMessage({
        type: "PANEL_STRUCTURE",
        payload: {
          value: false
        }
      }, "*");
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_lib_icons__WEBPACK_IMPORTED_MODULE_4__.IconCross, {
    size: "10"
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "ps-[12px] border-b-[1px]"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui_tabs__WEBPACK_IMPORTED_MODULE_2__.Tabs, {
    value: tabValue,
    onValueChange: setTabValue
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "flex items-center justify-between w-full py-[16px] pe-[12px]"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui_tabs__WEBPACK_IMPORTED_MODULE_2__.TabsList, {
    className: "w-[152px] rounded-[4px]"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui_tabs__WEBPACK_IMPORTED_MODULE_2__.TabsTrigger, {
    value: "builder",
    className: "py-[6px] px-[8px] w-full text-[12px] h-[28px]"
  }, "Builder"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui_tabs__WEBPACK_IMPORTED_MODULE_2__.TabsTrigger, {
    value: "template",
    className: "py-[6px] px-[8px] w-full text-[12px] h-[28px]"
  }, "Template")), tabValue === "builder" && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_button__WEBPACK_IMPORTED_MODULE_3__.Button, {
    className: "h-[28px] w-[28px] bg-transparent hover:bg-border-2 border-[1px] border-border-2 px-0 py-0 [&_svg]:size-[14px] rounded-[4px]",
    onClick: () => setIsOpenSearch(prev => !prev)
  }, isOpenSearch ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(lucide_react__WEBPACK_IMPORTED_MODULE_10__["default"], {
    size: 14,
    color: "#D5D8DC"
  }) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(lucide_react__WEBPACK_IMPORTED_MODULE_11__["default"], {
    size: 14,
    color: "#D5D8DC"
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui_tabs__WEBPACK_IMPORTED_MODULE_2__.TabsContent, {
    value: "builder",
    className: "mt-0 flex flex-col gap-[16px] pe-[4px]"
  }, isOpenSearch ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "flex items-center gap-[8px] px-[6px] border-[1px] border-border-2 rounded-[4px] me-[8px]"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_button__WEBPACK_IMPORTED_MODULE_3__.Button, {
    className: "h-[14px] w-[14px] bg-transparent hover:bg-transparent [&_svg]:size-[14px] cursor-default"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(lucide_react__WEBPACK_IMPORTED_MODULE_11__["default"], {
    size: "14",
    color: "#D5D8DC"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_input__WEBPACK_IMPORTED_MODULE_5__.Input, {
    value: searchText,
    onChange: e => setSearchText(e.target.value),
    placeholder: "Search your animation ...",
    className: "border-0 p-0 text-[13px] placeholder:text-text-2"
  }), searchText.length > 0 && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_button__WEBPACK_IMPORTED_MODULE_3__.Button, {
    className: "h-[14px] w-[14px] bg-transparent hover:bg-transparent [&_svg]:size-[14px]",
    onClick: () => setSearchText("")
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_lib_icons__WEBPACK_IMPORTED_MODULE_4__.IconCross, {
    size: "14",
    color: "#D5D8DC"
  }))) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_scroll_area__WEBPACK_IMPORTED_MODULE_7__.ScrollArea, {
    style: {
      height: size.height - 130
    },
    className: "pe-[8px] mb-[10px]",
    viewportClassName: "ab-sidebar-scroll-viewport"
  }, getFilteredContainers()?.length ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_accordion__WEBPACK_IMPORTED_MODULE_6__.Accordion, {
    type: "single",
    collapsible: true,
    defaultValue: "item-1"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_accordion__WEBPACK_IMPORTED_MODULE_6__.AccordionItem, {
    value: "item-1"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_accordion__WEBPACK_IMPORTED_MODULE_6__.AccordionTrigger, {
    className: "justify-start gap-[6px] "
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "flex items-center gap-[6px]"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
    "clip-path": "url(#clip0_11001_3995)"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M2.26981 11.7303C1.45825 10.9187 1.45825 9.6125 1.45825 7.00016C1.45825 4.3878 1.45825 3.08162 2.26981 2.27005C3.08137 1.4585 4.38755 1.4585 6.99992 1.4585C9.61226 1.4585 10.9185 1.4585 11.7301 2.27005C12.5416 3.08161 12.5416 4.3878 12.5416 7.00016C12.5416 9.6125 12.5416 10.9187 11.7301 11.7303C10.9185 12.5418 9.61226 12.5418 6.99992 12.5418C4.38755 12.5418 3.08137 12.5418 2.26981 11.7303Z",
    stroke: "#ffffff",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M1.45825 5.25H12.5416",
    stroke: "#ffffff"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M7 12.5417V5.25",
    stroke: "#ffffff"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
    id: "clip0_11001_3995"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
    width: "14",
    height: "14",
    fill: "white"
  })))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "text-[12px] text-text font-normal"
  }, "Body"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_accordion__WEBPACK_IMPORTED_MODULE_6__.AccordionContent, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "pt-[16px] pl-[20px] flex flex-col gap-[12px] ab-builder-list-item"
  }, getFilteredContainers()?.map((animation, i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    key: i,
    onClick: () => {
      (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.scrollToElement)(animation);
      if (animation?.aId) {
        window.parent.postMessage({
          type: "PANEL_ANIMATION_LIST_BUILDER",
          payload: {
            id: animation.aId
          }
        }, "*");
      }
    },
    onMouseEnter: () => setHoveredAnimation(animation),
    onMouseLeave: () => setHoveredAnimation(null),
    className: `flex items-center gap-[6px] cursor-pointer h-[16px] group`,
    "data-selector-list": animation.selector
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    className: "stroke-text-2 group-hover:stroke-[#FF8800]"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M5.47268 2.91962C6.17748 2.13988 6.52993 1.75 6.99992 1.75C7.46991 1.75 7.82236 2.13988 8.52714 2.91962L10.2606 4.83731C11.1979 5.87428 11.6666 6.39281 11.6666 7C11.6666 7.60719 11.1979 8.12572 10.2606 9.16271L8.52714 11.0804C7.82236 11.8601 7.46991 12.25 6.99992 12.25C6.52993 12.25 6.17748 11.8601 5.47268 11.0804L3.73927 9.16271C2.80193 8.12572 2.33325 7.60719 2.33325 7C2.33325 6.39281 2.80193 5.87428 3.73927 4.83731L5.47268 2.91962Z",
    stroke: ""
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: `text-[12px] text-text-2 group-hover:text-[#FF8800]`
  }, animation.name))))))) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, searchText ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_notFound_SeAnimNotFound__WEBPACK_IMPORTED_MODULE_9__["default"], null) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_notFound_STAnimNotFound__WEBPACK_IMPORTED_MODULE_8__["default"], null)))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ui_tabs__WEBPACK_IMPORTED_MODULE_2__.TabsContent, {
    value: "template",
    className: "mt-0 flex flex-col gap-[16px] pe-[4px]"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_scroll_area__WEBPACK_IMPORTED_MODULE_7__.ScrollArea, {
    style: {
      height: size.height - 130
    },
    className: "pe-[8px] mb-[10px]",
    viewportClassName: "ab-sidebar-scroll-viewport"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_accordion__WEBPACK_IMPORTED_MODULE_6__.Accordion, {
    type: "single",
    collapsible: true,
    defaultValue: "item-1"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_accordion__WEBPACK_IMPORTED_MODULE_6__.AccordionItem, {
    value: "item-1"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_accordion__WEBPACK_IMPORTED_MODULE_6__.AccordionTrigger, {
    className: "justify-start gap-[6px] "
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "flex items-center gap-[6px]"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
    "clip-path": "url(#clip0_11001_3995)"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M2.26981 11.7303C1.45825 10.9187 1.45825 9.6125 1.45825 7.00016C1.45825 4.3878 1.45825 3.08162 2.26981 2.27005C3.08137 1.4585 4.38755 1.4585 6.99992 1.4585C9.61226 1.4585 10.9185 1.4585 11.7301 2.27005C12.5416 3.08161 12.5416 4.3878 12.5416 7.00016C12.5416 9.6125 12.5416 10.9187 11.7301 11.7303C10.9185 12.5418 9.61226 12.5418 6.99992 12.5418C4.38755 12.5418 3.08137 12.5418 2.26981 11.7303Z",
    stroke: "#ffffff",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M1.45825 5.25H12.5416",
    stroke: "#ffffff"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M7 12.5417V5.25",
    stroke: "#ffffff"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
    id: "clip0_11001_3995"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
    width: "14",
    height: "14",
    fill: "white"
  })))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "text-[12px] text-text font-normal"
  }, "Body"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_ui_accordion__WEBPACK_IMPORTED_MODULE_6__.AccordionContent, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "pt-[16px] pl-[20px] flex flex-col gap-[12px] ab-template-list-item"
  }, containers?.map((animation, i) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    key: i,
    onClick: () => (0,_lib_animStructure__WEBPACK_IMPORTED_MODULE_1__.scrollToElement)(animation),
    onMouseEnter: () => setHoveredAnimation(animation),
    onMouseLeave: () => setHoveredAnimation(null),
    className: `flex items-center gap-[6px] cursor-pointer h-[16px] group`,
    "data-selector-list": animation.selector
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    className: "stroke-text-2 group-hover:stroke-[#21E23D]"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
    "clip-path": "url(#clip0_11001_4143)"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M8 13.3335V14.6668",
    stroke: "",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M8.54401 11.0532C8.40601 11.2312 8.20801 11.3332 8.00001 11.3332C7.79201 11.3332 7.59334 11.2312 7.45601 11.0532L5.51734 8.5545C5.39767 8.39434 5.33301 8.19977 5.33301 7.99984C5.33301 7.7999 5.39767 7.60533 5.51734 7.44517L7.45601 4.9465C7.59401 4.7685 7.79201 4.6665 8.00001 4.6665C8.20801 4.6665 8.40668 4.7685 8.54401 4.9465L10.4827 7.44517C10.6023 7.60533 10.667 7.7999 10.667 7.99984C10.667 8.19977 10.6023 8.39434 10.4827 8.5545L8.54401 11.0532Z",
    stroke: "",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M8 1.3335V2.66683",
    stroke: "",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M2 8H3.33333",
    stroke: "",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M12.6667 8H14.0001",
    stroke: "",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
    id: "clip0_11001_4143"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
    width: "16",
    height: "16",
    fill: "white"
  })))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: `text-[12px] text-text-2 group-hover:text-[#21E23D]`
  }, animation.name))))))))))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    onPointerDown: onResizePointerDown,
    className: "h-[16px] cursor-ns-resize flex items-center justify-center"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "17",
    height: "16",
    viewBox: "0 0 17 16",
    fill: "none"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M8.49731 8H8.50846",
    stroke: "#D5D8DC",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M12.4998 8H12.5109",
    stroke: "#D5D8DC",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
    d: "M4.49976 8H4.51087",
    stroke: "#D5D8DC",
    "stroke-width": "1.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  })))));
}

/***/ }),

/***/ "./src/modules/animation-builder/components/notFound/STAnimNotFound.jsx":
/*!******************************************************************************!*\
  !*** ./src/modules/animation-builder/components/notFound/STAnimNotFound.jsx ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const STAnimNotFound = () => {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "flex justify-center items-center"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
    width: 100,
    height: 71,
    src: "https://www.themecrowdy.com/wp-content/uploads/2025/10/no-animation-found.webp",
    alt: "Animation not found"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", {
    className: "text-[12px] font-medium text-text text-center mt-[12px]"
  }, "No Animation Found"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "text-[9px] text-text-3 text-center mt-[4px]"
  }, "This website does not use any animations or ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("br", null), " motion effects"));
};
/* harmony default export */ __webpack_exports__["default"] = (STAnimNotFound);

/***/ }),

/***/ "./src/modules/animation-builder/components/notFound/SeAnimNotFound.jsx":
/*!******************************************************************************!*\
  !*** ./src/modules/animation-builder/components/notFound/SeAnimNotFound.jsx ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const SeAnimNotFound = () => {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "flex justify-center items-center"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("img", {
    width: 100,
    height: 71,
    src: "http://www.themecrowdy.com/wp-content/uploads/2025/10/no-searchresult-found.webp",
    alt: "Animation not found"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", {
    className: "text-[12px] font-medium text-text text-center mt-[12px]"
  }, "No Result Found"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "text-[9px] text-text-3 text-center mt-[4px]"
  }, "We couldn\u2019t find anything matching your ", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("br", null), " search try different keywords"));
};
/* harmony default export */ __webpack_exports__["default"] = (SeAnimNotFound);

/***/ }),

/***/ "./src/modules/animation-builder/components/ui/accordion.jsx":
/*!*******************************************************************!*\
  !*** ./src/modules/animation-builder/components/ui/accordion.jsx ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Accordion: function() { return /* binding */ Accordion; },
/* harmony export */   AccordionContent: function() { return /* binding */ AccordionContent; },
/* harmony export */   AccordionItem: function() { return /* binding */ AccordionItem; },
/* harmony export */   AccordionTrigger: function() { return /* binding */ AccordionTrigger; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _radix_ui_react_accordion__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @radix-ui/react-accordion */ "./node_modules/@radix-ui/react-accordion/dist/index.mjs");
/* harmony import */ var _lib_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/utils */ "./src/modules/animation-builder/lib/utils.js");
/* harmony import */ var _lib_icons__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/icons */ "./src/modules/animation-builder/lib/icons.jsx");





const Accordion = _radix_ui_react_accordion__WEBPACK_IMPORTED_MODULE_3__.Root;
const AccordionItem = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(({
  className,
  ...props
}, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_accordion__WEBPACK_IMPORTED_MODULE_3__.Item, {
  ref: ref,
  className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_1__.cn)(className),
  ...props
}));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(({
  className,
  children,
  ...props
}, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_accordion__WEBPACK_IMPORTED_MODULE_3__.Header, {
  className: "flex"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_accordion__WEBPACK_IMPORTED_MODULE_3__.Trigger, {
  ref: ref,
  className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("flex flex-1 items-center justify-between bg-background text-[13px] text-text font-medium transition-all text-left [&>svg]:-rotate-90 [&[data-state=open]>svg]:rotate-0 cursor-pointer", className),
  ...props
}, children, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_lib_icons__WEBPACK_IMPORTED_MODULE_2__.IconChevronDown, {
  className: "shrink-0 transition-transform duration-200"
}))));
AccordionTrigger.displayName = _radix_ui_react_accordion__WEBPACK_IMPORTED_MODULE_3__.Trigger.displayName;
const AccordionContent = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(({
  className,
  children,
  ...props
}, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_accordion__WEBPACK_IMPORTED_MODULE_3__.Content, {
  ref: ref,
  className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
  ...props
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
  className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("pb-4 pt-0", className)
}, children)));
AccordionContent.displayName = _radix_ui_react_accordion__WEBPACK_IMPORTED_MODULE_3__.Content.displayName;


/***/ }),

/***/ "./src/modules/animation-builder/components/ui/button.jsx":
/*!****************************************************************!*\
  !*** ./src/modules/animation-builder/components/ui/button.jsx ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Button: function() { return /* binding */ Button; },
/* harmony export */   buttonVariants: function() { return /* binding */ buttonVariants; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @radix-ui/react-slot */ "./node_modules/@radix-ui/react-slot/dist/index.mjs");
/* harmony import */ var class_variance_authority__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! class-variance-authority */ "./node_modules/class-variance-authority/dist/index.mjs");
/* harmony import */ var _lib_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/utils */ "./src/modules/animation-builder/lib/utils.js");





const buttonVariants = (0,class_variance_authority__WEBPACK_IMPORTED_MODULE_1__.cva)("inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded text-xs text-text font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer", {
  variants: {
    variant: {
      default: "bg-button-primary hover:bg-button-primary-hover",
      secondary: "bg-button-secondary hover:bg-button-secondary-hover",
      tertiary: "bg-button-tertiary hover:bg-button-tertiary-hover",
      play: "bg-play-button hover:bg-play-button-hover",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-6 px-2.5 py-1",
      tertiary: "h-6 px-2 py-1",
      play: "h-[30px] w-full px-2 py-1",
      icon: "h-9 w-9"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
const Button = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? _radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_3__.Slot : "button";
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Comp, {
    className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_2__.cn)(buttonVariants({
      variant,
      size,
      className
    })),
    ref: ref,
    ...props
  });
});
Button.displayName = "Button";


/***/ }),

/***/ "./src/modules/animation-builder/components/ui/input.jsx":
/*!***************************************************************!*\
  !*** ./src/modules/animation-builder/components/ui/input.jsx ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Input: function() { return /* binding */ Input; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _lib_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/utils */ "./src/modules/animation-builder/lib/utils.js");



const Input = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(({
  className,
  type,
  ...props
}, ref) => {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: type,
    className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("flex h-[26px] w-full rounded border border-border-2 bg-input ps-1.5 pe-2 py-[5px] text-xs transition-colors text-text-2 file:text-text-2 focus:text-text-2 placeholder:text-placeholder focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50", className),
    ref: ref,
    ...props
  });
});
Input.displayName = "Input";


/***/ }),

/***/ "./src/modules/animation-builder/components/ui/scroll-area.jsx":
/*!*********************************************************************!*\
  !*** ./src/modules/animation-builder/components/ui/scroll-area.jsx ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ScrollArea: function() { return /* binding */ ScrollArea; },
/* harmony export */   ScrollBar: function() { return /* binding */ ScrollBar; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _radix_ui_react_scroll_area__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @radix-ui/react-scroll-area */ "./node_modules/@radix-ui/react-scroll-area/dist/index.mjs");
/* harmony import */ var _lib_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/utils */ "./src/modules/animation-builder/lib/utils.js");




const ScrollArea = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(({
  className,
  viewportClassName,
  children,
  ...props
}, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_scroll_area__WEBPACK_IMPORTED_MODULE_2__.Root, {
  ref: ref,
  className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("relative overflow-hidden", className),
  ...props
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_scroll_area__WEBPACK_IMPORTED_MODULE_2__.Viewport, {
  className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("h-full w-full rounded-[inherit] [&>div]:h-full", viewportClassName)
}, children), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ScrollBar, null), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_scroll_area__WEBPACK_IMPORTED_MODULE_2__.Corner, null)));
ScrollArea.displayName = _radix_ui_react_scroll_area__WEBPACK_IMPORTED_MODULE_2__.Root.displayName;
const ScrollBar = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(({
  className,
  orientation = "vertical",
  ...props
}, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_scroll_area__WEBPACK_IMPORTED_MODULE_2__.ScrollAreaScrollbar, {
  ref: ref,
  orientation: orientation,
  className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-[6px] border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-[10px] flex-col border-t border-t-transparent p-[1px]", className),
  ...props
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_scroll_area__WEBPACK_IMPORTED_MODULE_2__.ScrollAreaThumb, {
  className: "relative flex-1 rounded-full bg-border"
})));
ScrollBar.displayName = _radix_ui_react_scroll_area__WEBPACK_IMPORTED_MODULE_2__.ScrollAreaScrollbar.displayName;


/***/ }),

/***/ "./src/modules/animation-builder/components/ui/tabs.jsx":
/*!**************************************************************!*\
  !*** ./src/modules/animation-builder/components/ui/tabs.jsx ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Tabs: function() { return /* binding */ Tabs; },
/* harmony export */   TabsContent: function() { return /* binding */ TabsContent; },
/* harmony export */   TabsList: function() { return /* binding */ TabsList; },
/* harmony export */   TabsTrigger: function() { return /* binding */ TabsTrigger; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _radix_ui_react_tabs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @radix-ui/react-tabs */ "./node_modules/@radix-ui/react-tabs/dist/index.mjs");
/* harmony import */ var _lib_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/lib/utils */ "./src/modules/animation-builder/lib/utils.js");




const Tabs = _radix_ui_react_tabs__WEBPACK_IMPORTED_MODULE_2__.Root;
const TabsList = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(({
  className,
  ...props
}, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_tabs__WEBPACK_IMPORTED_MODULE_2__.List, {
  ref: ref,
  className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("inline-flex h-[28px] items-center justify-center rounded bg-background border border-border-2 overflow-hidden", className),
  ...props
}));
TabsList.displayName = _radix_ui_react_tabs__WEBPACK_IMPORTED_MODULE_2__.List.displayName;
const TabsTrigger = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(({
  className,
  ...props
}, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_tabs__WEBPACK_IMPORTED_MODULE_2__.Trigger, {
  ref: ref,
  className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("inline-flex items-center justify-center whitespace-nowrap px-2 py-1.5 h-full text-xs text-text-2 transition-all bg-background hover:bg-background-hover focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-button-secondary data-[state=active]:text-text cursor-pointer", className),
  ...props
}));
TabsTrigger.displayName = _radix_ui_react_tabs__WEBPACK_IMPORTED_MODULE_2__.Trigger.displayName;
const TabsContent = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(({
  className,
  ...props
}, ref) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_radix_ui_react_tabs__WEBPACK_IMPORTED_MODULE_2__.Content, {
  ref: ref,
  className: (0,_lib_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("mt-2.5 focus-visible:outline-none", className),
  ...props
}));
TabsContent.displayName = _radix_ui_react_tabs__WEBPACK_IMPORTED_MODULE_2__.Content.displayName;


/***/ }),

/***/ "./src/modules/animation-builder/frontend/animationUtils.js":
/*!******************************************************************!*\
  !*** ./src/modules/animation-builder/frontend/animationUtils.js ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extractLastSelector: function() { return /* binding */ extractLastSelector; },
/* harmony export */   extractNameAndValue: function() { return /* binding */ extractNameAndValue; },
/* harmony export */   getFullSelector: function() { return /* binding */ getFullSelector; },
/* harmony export */   getUniqueSelector: function() { return /* binding */ getUniqueSelector; },
/* harmony export */   handleMouseOver: function() { return /* binding */ handleMouseOver; },
/* harmony export */   hidePopup: function() { return /* binding */ hidePopup; },
/* harmony export */   resetAnimations: function() { return /* binding */ resetAnimations; },
/* harmony export */   showPopup: function() { return /* binding */ showPopup; }
/* harmony export */ });
function resetAnimations({
  config,
  timelines,
  createdScrollTriggers
}) {
  for (let x in timelines) {
    if (timelines[x].split && typeof timelines[x].split.revert === "function") {
      timelines[x].split.revert();
    }
    timelines[x].revert();
    timelines[x].kill();
  }
  createdScrollTriggers?.forEach(st => st.kill());
  createdScrollTriggers.length = 0;
  config?.forEach(section => {
    section.animations?.forEach(animation => {
      const selector = extractLastSelector(animation.applyAnimation.className);
      if (selector?.full && selector.full !== "") {
        gsap.set(selector.full, {
          clearProps: "all"
        });
      }
    });
  });
}
function getFullSelector(element) {
  const path = [];
  let depth = 0; // Track depth

  while (element && element.tagName.toLowerCase() !== "html" && depth < 5) {
    let selector = getUniqueSelector(element);
    // Check if the current element has an ID
    path.unshift(selector);
    if (document.querySelectorAll(selector).length === 1 || element.id) {
      break;
    }
    element = element.parentElement;
    depth++;
  }
  let result = path;
  if (path.length > 4) {
    result = [path[0], path[path.length - 1]];
  }
  return result.join(" ");
}
function getUniqueSelector(element) {
  const tag = element.tagName.toLowerCase();
  // Add ID if available
  if (element.id) {
    return `${tag}#${element.id}`; // Only tag and ID, skip classes
  }
  if (element.dataset.id) {
    let customClass = `.elementor-element-${element.dataset.id}`;
    if (document.querySelectorAll(customClass).length === 1) {
      return `${customClass}`; // Only tag and ID, skip classes
    }
  }

  // Add class names, excluding the hover-highlight class
  const classList = Array.from(element.classList).filter(cls => cls !== "wcf-animb--hover-highlight");
  if (classList.length > 0) {
    return `${tag}.${classList.join(".")}`; // Concatenated classes if no ID
  }
  return tag; // Return only tag if no ID or classes
}
function extractLastSelector(selector) {
  if (selector === undefined) {
    return {
      full: "",
      tag: "",
      classes: false,
      id: ""
    };
  }
  // Regular expression to match selectors based on common delimiters
  const lastPart = selector.trim().split(/[\s>+~]+/) // Split by spaces, >, +, or ~
  .pop() // Get the last element in the array
  .trim();

  // Extract the tag (if any) and classes (if any)
  const tag = lastPart.split(".")[0].split("#")[0]; // Takes the first part before classes or IDs
  const classes = lastPart.split(".").slice(1) // Remove the tag name
  .join("."); // Join classes back
  const id = lastPart.split("#")[1]; // Extract the ID if present

  return {
    full: lastPart,
    tag,
    classes,
    id
  };
}
function showPopup(selector, x, y) {
  const popup = document.getElementById("wcfanim-selectorPopup");
  const content = document.getElementById("wcfanim-popupContent");

  // Set the content of the popup (for example, display the selector string)
  content.textContent = selector;

  // Get the width and height of the popup and its content
  const popupWidth = popup.offsetWidth;
  const popupHeight = popup.offsetHeight;

  // Get the current viewport size
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Adjust the x-coordinate if the popup is too wide for the screen
  if (x + popupWidth > viewportWidth) {
    x = viewportWidth - popupWidth - 10; // Keep it 10px away from the right edge
  }

  // Adjust the y-coordinate if the popup is too tall for the screen
  if (y + popupHeight > viewportHeight) {
    y = viewportHeight - popupHeight - 10; // Keep it 10px away from the bottom edge
  }

  // Position the popup
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;

  // Show the popup
  popup.style.display = "block";
}
function hidePopup() {
  const popup = document.getElementById("wcfanim-selectorPopup");
  popup.style.display = "none";
}
function extractNameAndValue(data) {
  return data.map(item => ({
    name: item.name,
    value: item.value
  }));
}
function handleMouseOver(event) {
  const target = event.target;
  if (target.classList.contains("wcfanimb-skip-selector")) {
    return;
  }
  if (target.closest(".wcfanimb-skip-selector-full")) {
    return;
  }
  target.classList.add("wcf-animb--hover-highlight");
  target.addEventListener("mouseleave", () => {
    target.classList.remove("wcf-animb--hover-highlight");
  }, {
    once: true
  });
}

/***/ }),

/***/ "./src/modules/animation-builder/index.css":
/*!*************************************************!*\
  !*** ./src/modules/animation-builder/index.css ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/modules/animation-builder/lib/animStructure.js":
/*!************************************************************!*\
  !*** ./src/modules/animation-builder/lib/animStructure.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addElementToAnimations: function() { return /* binding */ addElementToAnimations; },
/* harmony export */   addOutlinesToAnimatedElements: function() { return /* binding */ addOutlinesToAnimatedElements; },
/* harmony export */   getUniqueSelector: function() { return /* binding */ getUniqueSelector; },
/* harmony export */   isLikelyAnimatedTarget: function() { return /* binding */ isLikelyAnimatedTarget; },
/* harmony export */   removeOutlinesFromElements: function() { return /* binding */ removeOutlinesFromElements; },
/* harmony export */   scrollToElement: function() { return /* binding */ scrollToElement; },
/* harmony export */   scrollToElementByData: function() { return /* binding */ scrollToElementByData; },
/* harmony export */   truncateText: function() { return /* binding */ truncateText; }
/* harmony export */ });
// Border management
const addOutlinesToAnimatedElements = animations => {
  animations.forEach(animation => {
    if (!animation.el) return;
    const outlineStyle = animation.animType === 'builder' ? "1px solid #F80" : "1px dashed #21E23D";

    // save original outline so we can restore it later
    if (!animation.el.dataset.originalOutline) {
      animation.el.dataset.originalOutline = animation.el.style.outline || "";
    }
    animation.el.style.setProperty("outline", outlineStyle, "important");
    animation.el.style.setProperty("outline-offset", "2px", "important"); // optional: pushes outline outward
  });
};
const removeOutlinesFromElements = () => {
  document.querySelectorAll("[data-original-outline]").forEach(el => {
    try {
      el.style.outline = el.dataset.originalOutline || "";
    } catch {}
    delete el.dataset.originalOutline;
  });
};

// Animation detection helpers
const isLikelyAnimatedTarget = el => {
  const skipTags = ["body", "html", "main", "header", "footer", "nav"];
  const skipClasses = ["wcf-cursor", "wcf-cursor-follower"];
  const skipIds = ["smooth-content"];
  try {
    const style = window.getComputedStyle(el);
    const inline = el.style;
    const tag = el.tagName.toLowerCase();
    if (skipTags.includes(tag)) return null;
    if ([...el.classList].some(cls => skipClasses.includes(cls))) return null;
    if (el.id && skipIds.includes(el.id)) return null;
    if (el._gsap || el._gsTransform || el.hasAttribute("data-gsap")) return true;
    if (inline.cssText) {
      if (inline.cssText.includes("transform") && !inline.cssText.includes("text-transform") || inline.cssText.includes("translate") || inline.cssText.includes("matrix") || inline.cssText.includes("scale") || inline.cssText.includes("rotate")) return true;
    }
    if (style.transform !== "none") {
      const t = style.transform;
      if (t.includes("translate") || t.includes("scale") || t.includes("rotate") || t.includes("matrix") && t !== "matrix(1, 0, 0, 1, 0, 0)") return true;
    }
    if (inline.opacity && inline.opacity !== "1") return true;
    return false;
  } catch {
    return false;
  }
};

// Unique selector
const getUniqueSelector = el => {
  if (!el || !el.tagName) return "element";
  let current = el;
  const segments = [];
  let depth = 0;
  while (current && current !== document.body && depth < 3) {
    const tag = current.tagName.toLowerCase();
    if (current.id) {
      segments.unshift(`#${current.id}`);
      break;
    }
    if (current.classList && current.classList.length > 0) {
      const cls = [...current.classList].slice(0, 2).map(c => `.${c}`).join("");
      segments.unshift(cls ? `${tag}${cls}` : tag);
    } else {
      segments.unshift(tag);
    }
    if (segments.length >= 2 && document.querySelectorAll(segments.join(" > ")).length === 1) break;
    current = current.parentElement;
    depth++;
  }
  let selector = segments.join(" > ");
  return selector;
};

// Add element to animation list
const addElementToAnimations = ({
  el,
  animations,
  seenSelectors,
  counterRef,
  context,
  animType = 'default',
  aId,
  aTitle
}) => {
  if (!document.contains(el)) return;
  let mainWrapper = el;
  let parent = el.parentElement;
  while (parent && parent !== document.body) {
    if (parent.hasAttribute && parent.hasAttribute("aria-label")) {
      mainWrapper = parent;
      break;
    }
    parent = parent.parentElement;
  }
  const targetEl = mainWrapper !== el && mainWrapper.hasAttribute("aria-label") ? mainWrapper : el;
  const selector = getUniqueSelector(targetEl);
  if (seenSelectors.has(selector)) return; // already added before → skip

  if (animType === 'builder') {
    targetEl.classList.add("hover-outline-highlight-builder");
    const overlay = createBuilderOverlay(selector, aId);
    targetEl.appendChild(overlay);
  } else {
    targetEl.classList.add("hover-outline-highlight-default");
    const overlay = createDefaultOverlay(selector);
    targetEl.appendChild(overlay);
  }
  seenSelectors.add(selector);
  const result = {
    name: context ? `${context} ${counterRef.current}` : aTitle,
    selector,
    animType,
    el: targetEl
  };
  if (aId) {
    result.aId = aId;
  }
  animations.push(result);
  counterRef.current++;
};
const scrollToElement = animation => {
  if (!animation.el) return;
  const rect = animation.el.getBoundingClientRect();
  const y = rect.top + window.pageYOffset - window.innerHeight / 3;
  window.scrollTo({
    top: y,
    behavior: "smooth"
  });
  animation.el.style.outline = "2px solid #55B2FF";
  setTimeout(() => animation.el.style.outline = "", 4000);
};
const scrollToElementByData = (attrName, attrValue) => {
  const el = document.querySelector(`[data-${attrName}="${attrValue}"]`);
  if (!el) return;
  const container = document.querySelector(".ab-sidebar-scroll-viewport");
  if (!container) return;
  container.scrollTo({
    top: el.offsetTop - container.clientHeight / 3,
    behavior: "smooth"
  });
  el.classList.add("active-item");
  setTimeout(() => el.classList.remove("active-item"), 2000);
};
const truncateText = (text, maxLength = 35) => text.length <= maxLength ? text : text.substring(0, maxLength - 3) + "...";

// A separate function that returns your overlay DOM node
const createDefaultOverlay = selector => {
  const overlay = document.createElement("div");
  overlay.className = "ab-highlight-action-default";
  overlay.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1px;" class="wcfanimb-skip-selector-full">

      <!-- First Icon -->
      <div style="
        display: flex;
        width: 26px;
        height: 26px;
        padding: 6px;
        justify-content: center;
        align-items: center;
        background: #21E23D;
        cursor: pointer;
        aspect-ratio: 1/1;"
        data-selector-target="${selector}"
        data-selector-tab="template"
        class="ab-setting-action"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <g clip-path="url(#clip0_11001_4982)">
        <path d="M12.4352 4.16597L12.1473 3.66629C11.9295 3.28839 11.8207 3.09944 11.6354 3.02409C11.4501 2.94875 11.2406 3.0082 10.8216 3.12711L10.1098 3.3276C9.84229 3.3893 9.56159 3.3543 9.31735 3.22879L9.12083 3.11541C8.91135 2.98125 8.75023 2.78344 8.66104 2.55093L8.46627 1.96912C8.33817 1.58411 8.27412 1.39161 8.12164 1.2815C7.96921 1.17139 7.76668 1.17139 7.36161 1.17139H6.71131C6.3063 1.17139 6.10377 1.17139 5.95128 1.2815C5.79883 1.39161 5.73479 1.58411 5.6067 1.96912L5.41189 2.55093C5.32271 2.78344 5.1616 2.98125 4.95213 3.11541L4.75562 3.22879C4.51135 3.3543 4.23068 3.3893 3.96316 3.3276L3.25136 3.12711C2.83232 3.0082 2.62281 2.94875 2.43756 3.02409C2.2523 3.09944 2.14343 3.28839 1.92567 3.66629L1.63775 4.16597C1.43364 4.5202 1.33158 4.69732 1.35139 4.88587C1.37119 5.07441 1.50782 5.22635 1.78107 5.53023L2.38251 6.20263C2.52951 6.38871 2.63387 6.71305 2.63387 7.00466C2.63387 7.29638 2.52955 7.6206 2.38253 7.80674L1.78107 8.47915C1.50782 8.78306 1.3712 8.93496 1.35139 9.12356C1.33158 9.31209 1.43364 9.48919 1.63775 9.84339L1.92567 10.3431C2.14342 10.721 2.2523 10.91 2.43756 10.9853C2.62281 11.0606 2.83233 11.0012 3.25137 10.8822L3.96313 10.6818C4.2307 10.62 4.51143 10.6551 4.75573 10.7806L4.95221 10.894C5.16163 11.0282 5.32271 11.2259 5.41188 11.4585L5.6067 12.0403C5.73479 12.4253 5.79883 12.6178 5.95128 12.728C6.10377 12.838 6.3063 12.838 6.71131 12.838H7.36161C7.76668 12.838 7.96921 12.838 8.12164 12.728C8.27412 12.6178 8.33817 12.4253 8.46627 12.0403L8.6611 11.4585C8.75024 11.2259 8.91129 11.0282 9.12077 10.894L9.31723 10.7806C9.56153 10.6551 9.84224 10.62 10.1098 10.6818L10.8216 10.8822C11.2406 11.0012 11.4501 11.0606 11.6354 10.9853C11.8207 10.91 11.9295 10.721 12.1473 10.3431L12.4352 9.84339C12.6393 9.48919 12.7413 9.31209 12.7216 9.12356C12.7017 8.93496 12.5651 8.78306 12.2919 8.47915L11.6904 7.80674C11.5434 7.6206 11.4391 7.29638 11.4391 7.00466C11.4391 6.71305 11.5435 6.38871 11.6904 6.20263L12.2919 5.53023C12.5651 5.22635 12.7017 5.07441 12.7216 4.88587C12.7413 4.69732 12.6393 4.5202 12.4352 4.16597Z" stroke="white" stroke-linecap="round"/>
        <path d="M9.05304 7.00016C9.05304 8.12775 8.13896 9.04183 7.01138 9.04183C5.88379 9.04183 4.96973 8.12775 4.96973 7.00016C4.96973 5.87258 5.88379 4.9585 7.01138 4.9585C8.13896 4.9585 9.05304 5.87258 9.05304 7.00016Z" stroke="white"/>
      </g>
      <defs>
        <clipPath id="clip0_11001_4982">
          <rect width="14" height="14" fill="white"/>
        </clipPath>
      </defs>
    </svg>
      </div>

      <!-- Second Icon -->
      <div style="
        display: flex;
        width: 26px;
        height: 26px;
        padding: 6px;
        justify-content: center;
        align-items: center;
        background: #6C6C6C;
        cursor: pointer;
        aspect-ratio: 1/1;"
        data-selector-copy="${selector}"
        class="ab-copy-action"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <g clip-path="url(#clip0_11001_4998)">
        <path d="M5.25 8.75C5.25 7.1001 5.25 6.27515 5.76256 5.76256C6.27515 5.25 7.1001 5.25 8.75 5.25H9.33333C10.9832 5.25 11.8082 5.25 12.3208 5.76256C12.8333 6.27515 12.8333 7.1001 12.8333 8.75V9.33333C12.8333 10.9832 12.8333 11.8082 12.3208 12.3208C11.8082 12.8333 10.9832 12.8333 9.33333 12.8333H8.75C7.1001 12.8333 6.27515 12.8333 5.76256 12.3208C5.25 11.8082 5.25 10.9832 5.25 9.33333V8.75Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.91661 5.24984C9.91521 3.52487 9.88914 2.63138 9.387 2.01959C9.29005 1.90144 9.18173 1.79311 9.0636 1.69615C8.4182 1.1665 7.45938 1.1665 5.54167 1.1665C3.62397 1.1665 2.66513 1.1665 2.01976 1.69615C1.90161 1.7931 1.79328 1.90144 1.69632 2.01959C1.16667 2.66496 1.16667 3.62381 1.16667 5.5415C1.16667 7.45921 1.16667 8.41804 1.69632 9.06344C1.79327 9.18156 1.90161 9.28989 2.01976 9.38684C2.63154 9.88897 3.52504 9.91505 5.25 9.91645" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_11001_4998">
          <rect width="14" height="14" fill="white"/>
        </clipPath>
      </defs>
    </svg>
      </div>
    </div>
  `;
  return overlay;
};
const createBuilderOverlay = (selector, aId) => {
  const overlay = document.createElement("div");
  overlay.className = "ab-highlight-action-builder";
  overlay.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1px;" class="wcfanimb-skip-selector-full">

      <!-- First Icon -->
      <div style="
        display: flex;
        width: 26px;
        height: 26px;
        padding: 6px;
        justify-content: center;
        align-items: center;
        background: #FF8800;
        cursor: pointer;
        aspect-ratio: 1/1;"
        data-selector-target="${selector}"
        data-selector-tab="builder"
        data-selector-aid="${aId}"
        class="ab-setting-action"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <g clip-path="url(#clip0_11001_4982)">
        <path d="M12.4352 4.16597L12.1473 3.66629C11.9295 3.28839 11.8207 3.09944 11.6354 3.02409C11.4501 2.94875 11.2406 3.0082 10.8216 3.12711L10.1098 3.3276C9.84229 3.3893 9.56159 3.3543 9.31735 3.22879L9.12083 3.11541C8.91135 2.98125 8.75023 2.78344 8.66104 2.55093L8.46627 1.96912C8.33817 1.58411 8.27412 1.39161 8.12164 1.2815C7.96921 1.17139 7.76668 1.17139 7.36161 1.17139H6.71131C6.3063 1.17139 6.10377 1.17139 5.95128 1.2815C5.79883 1.39161 5.73479 1.58411 5.6067 1.96912L5.41189 2.55093C5.32271 2.78344 5.1616 2.98125 4.95213 3.11541L4.75562 3.22879C4.51135 3.3543 4.23068 3.3893 3.96316 3.3276L3.25136 3.12711C2.83232 3.0082 2.62281 2.94875 2.43756 3.02409C2.2523 3.09944 2.14343 3.28839 1.92567 3.66629L1.63775 4.16597C1.43364 4.5202 1.33158 4.69732 1.35139 4.88587C1.37119 5.07441 1.50782 5.22635 1.78107 5.53023L2.38251 6.20263C2.52951 6.38871 2.63387 6.71305 2.63387 7.00466C2.63387 7.29638 2.52955 7.6206 2.38253 7.80674L1.78107 8.47915C1.50782 8.78306 1.3712 8.93496 1.35139 9.12356C1.33158 9.31209 1.43364 9.48919 1.63775 9.84339L1.92567 10.3431C2.14342 10.721 2.2523 10.91 2.43756 10.9853C2.62281 11.0606 2.83233 11.0012 3.25137 10.8822L3.96313 10.6818C4.2307 10.62 4.51143 10.6551 4.75573 10.7806L4.95221 10.894C5.16163 11.0282 5.32271 11.2259 5.41188 11.4585L5.6067 12.0403C5.73479 12.4253 5.79883 12.6178 5.95128 12.728C6.10377 12.838 6.3063 12.838 6.71131 12.838H7.36161C7.76668 12.838 7.96921 12.838 8.12164 12.728C8.27412 12.6178 8.33817 12.4253 8.46627 12.0403L8.6611 11.4585C8.75024 11.2259 8.91129 11.0282 9.12077 10.894L9.31723 10.7806C9.56153 10.6551 9.84224 10.62 10.1098 10.6818L10.8216 10.8822C11.2406 11.0012 11.4501 11.0606 11.6354 10.9853C11.8207 10.91 11.9295 10.721 12.1473 10.3431L12.4352 9.84339C12.6393 9.48919 12.7413 9.31209 12.7216 9.12356C12.7017 8.93496 12.5651 8.78306 12.2919 8.47915L11.6904 7.80674C11.5434 7.6206 11.4391 7.29638 11.4391 7.00466C11.4391 6.71305 11.5435 6.38871 11.6904 6.20263L12.2919 5.53023C12.5651 5.22635 12.7017 5.07441 12.7216 4.88587C12.7413 4.69732 12.6393 4.5202 12.4352 4.16597Z" stroke="white" stroke-linecap="round"/>
        <path d="M9.05304 7.00016C9.05304 8.12775 8.13896 9.04183 7.01138 9.04183C5.88379 9.04183 4.96973 8.12775 4.96973 7.00016C4.96973 5.87258 5.88379 4.9585 7.01138 4.9585C8.13896 4.9585 9.05304 5.87258 9.05304 7.00016Z" stroke="white"/>
      </g>
      <defs>
        <clipPath id="clip0_11001_4982">
          <rect width="14" height="14" fill="white"/>
        </clipPath>
      </defs>
    </svg>
      </div>

      <!-- Second Icon -->
      <div style="
        display: flex;
        width: 26px;
        height: 26px;
        padding: 6px;
        justify-content: center;
        align-items: center;
        background: #6C6C6C;
        cursor: pointer;
        aspect-ratio: 1/1;"
        data-selector-copy="${selector}"
        class="ab-copy-action"
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <g clip-path="url(#clip0_11001_4998)">
        <path d="M5.25 8.75C5.25 7.1001 5.25 6.27515 5.76256 5.76256C6.27515 5.25 7.1001 5.25 8.75 5.25H9.33333C10.9832 5.25 11.8082 5.25 12.3208 5.76256C12.8333 6.27515 12.8333 7.1001 12.8333 8.75V9.33333C12.8333 10.9832 12.8333 11.8082 12.3208 12.3208C11.8082 12.8333 10.9832 12.8333 9.33333 12.8333H8.75C7.1001 12.8333 6.27515 12.8333 5.76256 12.3208C5.25 11.8082 5.25 10.9832 5.25 9.33333V8.75Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9.91661 5.24984C9.91521 3.52487 9.88914 2.63138 9.387 2.01959C9.29005 1.90144 9.18173 1.79311 9.0636 1.69615C8.4182 1.1665 7.45938 1.1665 5.54167 1.1665C3.62397 1.1665 2.66513 1.1665 2.01976 1.69615C1.90161 1.7931 1.79328 1.90144 1.69632 2.01959C1.16667 2.66496 1.16667 3.62381 1.16667 5.5415C1.16667 7.45921 1.16667 8.41804 1.69632 9.06344C1.79327 9.18156 1.90161 9.28989 2.01976 9.38684C2.63154 9.88897 3.52504 9.91505 5.25 9.91645" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_11001_4998">
          <rect width="14" height="14" fill="white"/>
        </clipPath>
      </defs>
    </svg>
      </div>
    </div>
  `;
  return overlay;
};

/***/ }),

/***/ "./src/modules/animation-builder/lib/icons.jsx":
/*!*****************************************************!*\
  !*** ./src/modules/animation-builder/lib/icons.jsx ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IconAlert: function() { return /* binding */ IconAlert; },
/* harmony export */   IconCheck: function() { return /* binding */ IconCheck; },
/* harmony export */   IconChevronDown: function() { return /* binding */ IconChevronDown; },
/* harmony export */   IconCopy: function() { return /* binding */ IconCopy; },
/* harmony export */   IconCross: function() { return /* binding */ IconCross; },
/* harmony export */   IconDelete: function() { return /* binding */ IconDelete; },
/* harmony export */   IconDrag: function() { return /* binding */ IconDrag; },
/* harmony export */   IconHelp: function() { return /* binding */ IconHelp; },
/* harmony export */   IconPlaceholderS: function() { return /* binding */ IconPlaceholderS; },
/* harmony export */   IconPlay: function() { return /* binding */ IconPlay; },
/* harmony export */   IconPlus: function() { return /* binding */ IconPlus; },
/* harmony export */   IconPlus2: function() { return /* binding */ IconPlus2; }
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./src/modules/animation-builder/lib/utils.js");


const IconCross = ({
  size = "12",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-2 hover:fill-text", className),
  viewBox: "0 0 12 12",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
  clipPath: "url(#clip0_3993_3560)"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M10.995 1.00507C11.2684 1.27844 11.2684 1.72166 10.995 1.99502L1.99502 10.995C1.72166 11.2684 1.27844 11.2684 1.00507 10.995C0.731707 10.7217 0.731707 10.2784 1.00507 10.0051L10.0051 1.00507C10.2784 0.731707 10.7217 0.731707 10.995 1.00507Z"
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M1.00507 1.00507C1.27844 0.731707 1.72166 0.731707 1.99502 1.00507L10.995 10.0051C11.2684 10.2784 11.2684 10.7217 10.995 10.995C10.7217 11.2684 10.2784 11.2684 10.0051 10.995L1.00507 1.99502C0.731707 1.72166 0.731707 1.27844 1.00507 1.00507Z"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
  id: "clip0_3993_3560"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  width: "12",
  height: "12",
  fill: "white"
}))));
const IconCopy = ({
  size = "12",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-2 hover:fill-text", className),
  viewBox: "0 0 12 12",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
  "clip-path": "url(#clip0_3993_3573)"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M1.375 3.375C1.375 3.09886 1.59886 2.875 1.875 2.875H8.625C8.90114 2.875 9.125 3.09886 9.125 3.375V10.125C9.125 10.4011 8.90114 10.625 8.625 10.625H1.875C1.59886 10.625 1.375 10.4011 1.375 10.125V3.375ZM2.375 3.875V9.625H8.125V3.875H2.375Z"
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M2.87476 1.875C2.87476 1.59886 3.09861 1.375 3.37476 1.375H10.1248C10.4009 1.375 10.6248 1.59886 10.6248 1.875V8.625C10.6248 8.90114 10.4009 9.125 10.1248 9.125C9.84861 9.125 9.62476 8.90114 9.62476 8.625V2.375H3.37476C3.09861 2.375 2.87476 2.15114 2.87476 1.875Z"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
  id: "clip0_3993_3573"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  width: "12",
  height: "12",
  fill: "white"
}))));
const IconDelete = ({
  size = "12",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-2 hover:fill-text", className),
  viewBox: "0 0 12 12",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
  "clip-path": "url(#clip0_3993_3577)"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M1.25 2.625C1.25 2.27982 1.52982 2 1.875 2H10.125C10.4702 2 10.75 2.27982 10.75 2.625C10.75 2.97018 10.4702 3.25 10.125 3.25H1.875C1.52982 3.25 1.25 2.97018 1.25 2.625Z"
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M3.625 1.125C3.625 0.848858 3.84886 0.625 4.125 0.625H7.875C8.15114 0.625 8.375 0.848858 8.375 1.125C8.375 1.40114 8.15114 1.625 7.875 1.625H4.125C3.84886 1.625 3.625 1.40114 3.625 1.125Z"
}), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M2.625 2.125C2.90114 2.125 3.125 2.34886 3.125 2.625V9.625H8.875V2.625C8.875 2.34886 9.09886 2.125 9.375 2.125C9.65114 2.125 9.875 2.34886 9.875 2.625V9.75C9.875 9.98206 9.78281 10.2046 9.61872 10.3687C9.45462 10.5328 9.23206 10.625 9 10.625H3C2.76794 10.625 2.54538 10.5328 2.38128 10.3687C2.21719 10.2046 2.125 9.98206 2.125 9.75V2.625C2.125 2.34886 2.34886 2.125 2.625 2.125Z"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
  id: "clip0_3993_3577"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  width: "12",
  height: "12",
  fill: "white"
}))));
const IconPlus = ({
  size = "12",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-2 hover:fill-text", className),
  viewBox: "0 0 12 12",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
  "clip-path": "url(#clip0_4001_2972)"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M6.625 0.75C6.625 0.404822 6.34518 0.125 6 0.125C5.65482 0.125 5.375 0.404822 5.375 0.75V5.375H0.75C0.404822 5.375 0.125 5.65482 0.125 6C0.125 6.34518 0.404822 6.625 0.75 6.625H5.375V11.25C5.375 11.5952 5.65482 11.875 6 11.875C6.34518 11.875 6.625 11.5952 6.625 11.25V6.625H11.25C11.5952 6.625 11.875 6.34518 11.875 6C11.875 5.65482 11.5952 5.375 11.25 5.375H6.625V0.75Z"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
  id: "clip0_4001_2972"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  width: "12",
  height: "12",
  fill: "white"
}))));
const IconPlus2 = ({
  size = "16",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-2 hover:fill-text", className),
  viewBox: "0 0 16 16",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M8.75 3C8.75 2.58579 8.41421 2.25 8 2.25C7.58579 2.25 7.25 2.58579 7.25 3V7.25H3C2.58579 7.25 2.25 7.58579 2.25 8C2.25 8.41421 2.58579 8.75 3 8.75H7.25V13C7.25 13.4142 7.58579 13.75 8 13.75C8.41421 13.75 8.75 13.4142 8.75 13V8.75H13C13.4142 8.75 13.75 8.41421 13.75 8C13.75 7.58579 13.4142 7.25 13 7.25H8.75V3Z"
}));
const IconChevronDown = ({
  size = "12",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-2 hover:fill-text", className),
  viewBox: "0 0 12 12",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
  "clip-path": "url(#clip0_3993_3566)"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M0.969914 3.78998C1.26281 3.49709 1.73768 3.49709 2.03057 3.78998L6.00024 7.75965L9.96991 3.78998C10.2628 3.49709 10.7377 3.49709 11.0306 3.78998C11.3235 4.08288 11.3235 4.55775 11.0306 4.85064L6.53057 9.35064C6.23768 9.64354 5.76281 9.64354 5.46991 9.35064L0.969914 4.85064C0.677021 4.55775 0.677021 4.08288 0.969914 3.78998Z"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
  id: "clip0_3993_3566"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  width: "12",
  height: "12",
  fill: "white"
}))));
const IconHelp = ({
  size = "14",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-2 hover:fill-text", className),
  viewBox: "0 0 14 14",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
  "clip-path": "url(#clip0_3484_5478)"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  d: "M7 1.80005C5.87512 1.80005 4.7755 2.13361 3.8402 2.75857C2.90489 3.38352 2.17591 4.27178 1.74544 5.31104C1.31496 6.35029 1.20233 7.49386 1.42179 8.59713C1.64124 9.70039 2.18292 10.7138 2.97833 11.5092C3.77374 12.3046 4.78716 12.8463 5.89043 13.0658C6.99369 13.2852 8.13726 13.1726 9.17651 12.7421C10.2158 12.3116 11.104 11.5827 11.729 10.6474C12.3539 9.71205 12.6875 8.61243 12.6875 7.48755C12.6859 5.97962 12.0862 4.53391 11.0199 3.46764C9.95365 2.40137 8.50793 1.80164 7 1.80005ZM6.78125 4.42505C6.91105 4.42505 7.03793 4.46354 7.14585 4.53565C7.25377 4.60776 7.33788 4.71025 7.38755 4.83016C7.43722 4.95008 7.45021 5.08203 7.42489 5.20933C7.39957 5.33663 7.33707 5.45356 7.24529 5.54534C7.15351 5.63712 7.03658 5.69962 6.90928 5.72494C6.78198 5.75026 6.65003 5.73726 6.53012 5.68759C6.4102 5.63792 6.30771 5.55381 6.2356 5.44589C6.16349 5.33797 6.125 5.21109 6.125 5.0813C6.125 4.90725 6.19414 4.74033 6.31721 4.61726C6.44028 4.49419 6.6072 4.42505 6.78125 4.42505ZM7.4375 10.55C7.20544 10.55 6.98288 10.4579 6.81878 10.2938C6.65469 10.1297 6.5625 9.90711 6.5625 9.67505V7.48755C6.44647 7.48755 6.33519 7.44145 6.25314 7.35941C6.1711 7.27736 6.125 7.16608 6.125 7.05005C6.125 6.93402 6.1711 6.82274 6.25314 6.74069C6.33519 6.65864 6.44647 6.61255 6.5625 6.61255C6.79457 6.61255 7.01713 6.70474 7.18122 6.86883C7.34531 7.03292 7.4375 7.25548 7.4375 7.48755V9.67505C7.55353 9.67505 7.66481 9.72114 7.74686 9.80319C7.82891 9.88524 7.875 9.99652 7.875 10.1125C7.875 10.2286 7.82891 10.3399 7.74686 10.4219C7.66481 10.504 7.55353 10.55 7.4375 10.55Z"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
  id: "clip0_3484_5478"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  width: "14",
  height: "14",
  fill: "white"
}))));
const IconPlaceholderS = ({
  size = "10",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-placeholder", className),
  viewBox: "0 0 10 10",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  d: "M6.95801 6.93359C6.95801 6.75098 6.92936 6.58984 6.87207 6.4502C6.81836 6.30697 6.72168 6.17806 6.58203 6.06348C6.44596 5.94889 6.25618 5.83968 6.0127 5.73584C5.77279 5.632 5.46842 5.52637 5.09961 5.41895C4.71289 5.30436 4.36377 5.17725 4.05225 5.0376C3.74072 4.89437 3.47396 4.73145 3.25195 4.54883C3.02995 4.36621 2.85986 4.15674 2.7417 3.92041C2.62354 3.68408 2.56445 3.41374 2.56445 3.10938C2.56445 2.80501 2.62712 2.52393 2.75244 2.26611C2.87777 2.0083 3.0568 1.78451 3.28955 1.59473C3.52588 1.40137 3.80697 1.25098 4.13281 1.14355C4.45866 1.03613 4.8221 0.982422 5.22314 0.982422C5.81038 0.982422 6.30811 1.09521 6.71631 1.3208C7.12809 1.54281 7.44141 1.83464 7.65625 2.19629C7.87109 2.55436 7.97852 2.9375 7.97852 3.3457H6.94727C6.94727 3.05208 6.8846 2.79248 6.75928 2.56689C6.63395 2.33773 6.44417 2.15869 6.18994 2.02979C5.93571 1.8973 5.61344 1.83105 5.22314 1.83105C4.85433 1.83105 4.54997 1.88656 4.31006 1.99756C4.07015 2.10856 3.89111 2.25895 3.77295 2.44873C3.65837 2.63851 3.60107 2.85514 3.60107 3.09863C3.60107 3.26335 3.63509 3.41374 3.70312 3.5498C3.77474 3.68229 3.88395 3.80583 4.03076 3.92041C4.18115 4.03499 4.37093 4.14062 4.6001 4.2373C4.83284 4.33398 5.11035 4.42708 5.43262 4.5166C5.87663 4.64193 6.25977 4.78158 6.58203 4.93555C6.9043 5.08952 7.16927 5.26318 7.37695 5.45654C7.58822 5.64632 7.74398 5.86296 7.84424 6.10645C7.94808 6.34635 8 6.61849 8 6.92285C8 7.24154 7.93555 7.52979 7.80664 7.7876C7.67773 8.04541 7.49333 8.26562 7.25342 8.44824C7.01351 8.63086 6.72526 8.7723 6.38867 8.87256C6.05566 8.96924 5.68327 9.01758 5.27148 9.01758C4.90983 9.01758 4.55355 8.96745 4.20264 8.86719C3.85531 8.76693 3.53841 8.61654 3.25195 8.41602C2.96908 8.21549 2.7417 7.96842 2.56982 7.6748C2.40153 7.3776 2.31738 7.03385 2.31738 6.64355H3.34863C3.34863 6.91211 3.40055 7.14307 3.50439 7.33643C3.60824 7.5262 3.74967 7.68376 3.92871 7.80908C4.11133 7.93441 4.31722 8.02751 4.54639 8.08838C4.77913 8.14567 5.02083 8.17432 5.27148 8.17432C5.63314 8.17432 5.93929 8.12419 6.18994 8.02393C6.44059 7.92367 6.63037 7.78044 6.75928 7.59424C6.89176 7.40804 6.95801 7.18783 6.95801 6.93359Z"
}));
const IconCheck = ({
  size = "12",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-2 hover:fill-text", className),
  viewBox: "0 0 12 12",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
  "clip-path": "url(#clip0_3484_5490)"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M10.9419 2.93306C11.186 3.17714 11.186 3.57286 10.9419 3.81694L4.94194 9.81694C4.69786 10.061 4.30214 10.061 4.05806 9.81694L1.43306 7.19194C1.18898 6.94786 1.18898 6.55214 1.43306 6.30806C1.67714 6.06398 2.07286 6.06398 2.31694 6.30806L4.5 8.49112L10.0581 2.93306C10.3021 2.68898 10.6979 2.68898 10.9419 2.93306Z"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
  id: "clip0_3484_5490"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  width: "12",
  height: "12",
  fill: "white"
}))));
const IconPlay = ({
  size = "16",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-2 hover:fill-text", className),
  viewBox: "0 0 16 16",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
  "clip-path": "url(#clip0_4071_3480)"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  "fill-rule": "evenodd",
  "clip-rule": "evenodd",
  d: "M4.4574 1.51622C4.63067 1.42082 4.82604 1.37278 5.0238 1.37696C5.22156 1.38114 5.41472 1.43739 5.58381 1.54003L5.58558 1.54111L14.5881 7.04711C14.5886 7.0474 14.5891 7.04769 14.5895 7.04798C14.7528 7.14713 14.8878 7.28662 14.9816 7.45305C15.0757 7.61997 15.1252 7.80833 15.1252 7.99992C15.1252 8.19152 15.0757 8.37988 14.9816 8.54679C14.8878 8.71322 14.7528 8.85271 14.5895 8.95187C14.5891 8.95216 14.5886 8.95245 14.5881 8.95273L5.58558 14.4587L5.58381 14.4598C5.41472 14.5625 5.22156 14.6187 5.0238 14.6229C4.82604 14.6271 4.63067 14.579 4.4574 14.4836C4.28412 14.3882 4.13906 14.2488 4.03685 14.0795C3.93464 13.9101 3.87889 13.7168 3.87522 13.519L3.875 13.5074L3.87511 2.48081C3.87878 2.28304 3.93464 2.08974 4.03685 1.92039C4.13907 1.75104 4.28412 1.61163 4.4574 1.51622ZM5.12511 2.72474L13.7503 7.99992L5.12511 13.2751V2.72474Z"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
  id: "clip0_4071_3480"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  width: "16",
  height: "16",
  fill: "white"
}))));
const IconAlert = ({
  size = "24",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-3", className),
  viewBox: "0 0 24 24",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
  "clip-path": "url(#clip0_4071_3550)"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  d: "M22.2005 17.6291L14.0021 3.39129C13.7972 3.04247 13.5047 2.75325 13.1536 2.55229C12.8026 2.35133 12.4051 2.24561 12.0005 2.24561C11.596 2.24561 11.1985 2.35133 10.8474 2.55229C10.4963 2.75325 10.2038 3.04247 9.99895 3.39129L1.80052 17.6291C1.60339 17.9665 1.49951 18.3502 1.49951 18.741C1.49951 19.1317 1.60339 19.5155 1.80052 19.8529C2.00276 20.2038 2.29474 20.4946 2.64648 20.6954C2.99822 20.8962 3.39706 20.9999 3.80208 20.9957H20.199C20.6037 20.9995 21.0021 20.8958 21.3535 20.6949C21.7049 20.4941 21.9966 20.2035 22.1986 19.8529C22.396 19.5156 22.5003 19.132 22.5006 18.7412C22.5009 18.3505 22.3974 17.9667 22.2005 17.6291ZM11.2505 9.74567C11.2505 9.54675 11.3295 9.35599 11.4702 9.21534C11.6108 9.07468 11.8016 8.99567 12.0005 8.99567C12.1994 8.99567 12.3902 9.07468 12.5308 9.21534C12.6715 9.35599 12.7505 9.54675 12.7505 9.74567V13.4957C12.7505 13.6946 12.6715 13.8853 12.5308 14.026C12.3902 14.1666 12.1994 14.2457 12.0005 14.2457C11.8016 14.2457 11.6108 14.1666 11.4702 14.026C11.3295 13.8853 11.2505 13.6946 11.2505 13.4957V9.74567ZM12.0005 17.9957C11.778 17.9957 11.5605 17.9297 11.3755 17.8061C11.1905 17.6825 11.0463 17.5068 10.9612 17.3012C10.876 17.0956 10.8537 16.8694 10.8971 16.6512C10.9405 16.433 11.0477 16.2325 11.205 16.0752C11.3624 15.9178 11.5628 15.8107 11.781 15.7673C11.9993 15.7239 12.2255 15.7462 12.431 15.8313C12.6366 15.9165 12.8123 16.0606 12.9359 16.2457C13.0595 16.4307 13.1255 16.6482 13.1255 16.8707C13.1255 17.169 13.007 17.4552 12.796 17.6662C12.585 17.8771 12.2989 17.9957 12.0005 17.9957Z"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
  id: "clip0_4071_3550"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  width: "24",
  height: "24",
  fill: "white"
}))));
const IconDrag = ({
  size = "12",
  className
}) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  className: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.cn)("fill-text-2 hover:fill-text", className),
  viewBox: "0 0 12 12",
  fill: "currentColor"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("g", {
  "clip-path": "url(#clip0_7019_4398)"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("path", {
  d: "M6 7.09961C6.22086 7.09967 6.40039 7.27912 6.40039 7.5V9.9082L7.2168 9.0918C7.37301 8.93559 7.62699 8.93559 7.7832 9.0918C7.93938 9.24801 7.9394 9.502 7.7832 9.6582L6.2832 11.1582C6.26467 11.1767 6.24353 11.1924 6.22168 11.207C6.21348 11.2125 6.20479 11.2169 6.19629 11.2217C6.18198 11.2298 6.16768 11.2378 6.15234 11.2441C6.14536 11.247 6.13797 11.2485 6.13086 11.251C6.08963 11.2654 6.0461 11.2754 6 11.2754C5.92444 11.2754 5.85429 11.2533 5.79395 11.2168C5.78845 11.2135 5.78271 11.2106 5.77734 11.207C5.75573 11.1925 5.73515 11.1766 5.7168 11.1582L4.2168 9.6582L4.16602 9.59473C4.06365 9.43949 4.08017 9.22842 4.2168 9.0918C4.35342 8.95517 4.56449 8.93865 4.71973 9.04102L4.7832 9.0918L5.59961 9.9082V7.5C5.59961 7.27909 5.77909 7.09961 6 7.09961ZM9.0918 4.2168C9.22842 4.08028 9.43953 4.06368 9.59473 4.16602L9.6582 4.2168L11.1582 5.7168C11.1641 5.72273 11.1683 5.73013 11.1738 5.73633C11.1811 5.7445 11.1878 5.75297 11.1943 5.76172C11.2008 5.77042 11.2072 5.779 11.2129 5.78809C11.2224 5.80312 11.2308 5.81866 11.2383 5.83496C11.2412 5.8415 11.2445 5.84784 11.2471 5.85449C11.2534 5.87055 11.2575 5.8873 11.2617 5.9043C11.2772 5.96707 11.277 6.03191 11.2617 6.09473C11.2575 6.11175 11.2533 6.12845 11.2471 6.14453C11.2457 6.14809 11.2446 6.15175 11.2432 6.15527C11.2348 6.17491 11.2241 6.19306 11.2129 6.21094C11.2072 6.22006 11.2008 6.22857 11.1943 6.2373C11.1878 6.24608 11.1811 6.2545 11.1738 6.2627C11.1682 6.26909 11.1643 6.27709 11.1582 6.2832L9.6582 7.7832C9.502 7.9394 9.24801 7.93938 9.0918 7.7832C8.93559 7.62699 8.93559 7.37301 9.0918 7.2168L9.9082 6.40039H7.5C7.27909 6.40039 7.09961 6.22091 7.09961 6C7.09961 5.77909 7.27909 5.59961 7.5 5.59961H9.9082L9.0918 4.7832L9.04102 4.71973C8.93865 4.56449 8.95517 4.35342 9.0918 4.2168ZM2.3418 4.2168C2.49801 4.06064 2.75201 4.06061 2.9082 4.2168C3.06431 4.37299 3.06433 4.62702 2.9082 4.7832L2.0918 5.59961H4.5L4.58105 5.6084C4.76304 5.64592 4.90039 5.80691 4.90039 6C4.90039 6.19309 4.76304 6.35408 4.58105 6.3916L4.5 6.40039H2.0918L2.9082 7.2168L2.95898 7.28027C3.06127 7.43548 3.04475 7.6466 2.9082 7.7832C2.77161 7.91979 2.5605 7.93626 2.40527 7.83398L2.3418 7.7832L0.841797 6.2832C0.809222 6.25063 0.784614 6.21313 0.765625 6.17383C0.750958 6.14361 0.738146 6.11198 0.731445 6.07812C0.721235 6.02636 0.721119 5.97265 0.731445 5.9209C0.735515 5.90059 0.742979 5.88138 0.75 5.8623C0.75187 5.85719 0.752798 5.85173 0.754883 5.84668C0.761577 5.83057 0.770639 5.81575 0.779297 5.80078C0.796441 5.77103 0.816384 5.74221 0.841797 5.7168L2.3418 4.2168ZM6.01953 0.726562C6.03195 0.727142 6.04432 0.727763 6.05664 0.729492C6.07056 0.731478 6.08423 0.733922 6.09766 0.737305C6.10695 0.739615 6.11586 0.743107 6.125 0.746094C6.13692 0.750034 6.14876 0.753788 6.16016 0.758789C6.20468 0.778163 6.24679 0.80538 6.2832 0.841797L7.7832 2.3418L7.83398 2.40527C7.93632 2.56047 7.91972 2.77158 7.7832 2.9082C7.6466 3.04481 7.43551 3.0613 7.28027 2.95898L7.2168 2.9082L6.40039 2.0918V4.5C6.40039 4.72088 6.22086 4.90033 6 4.90039C5.77909 4.90039 5.59961 4.72091 5.59961 4.5V2.0918L4.7832 2.9082C4.627 3.0644 4.37301 3.06438 4.2168 2.9082C4.06059 2.75199 4.06059 2.49801 4.2168 2.3418L5.7168 0.841797C5.7639 0.794717 5.823 0.760246 5.88867 0.741211C5.8949 0.739405 5.90094 0.736851 5.90723 0.735352C5.9231 0.731583 5.93952 0.730328 5.95605 0.728516C5.96387 0.727642 5.97165 0.726978 5.97949 0.726562C5.98627 0.72622 5.99314 0.724609 6 0.724609C6.00657 0.724611 6.01304 0.726247 6.01953 0.726562Z",
  fill: "#D5D8DC"
})), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("defs", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("clipPath", {
  id: "clip0_7019_4398"
}, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("rect", {
  width: "12",
  height: "12",
  fill: "white"
}))));

/***/ }),

/***/ "./src/modules/animation-builder/lib/utils.js":
/*!****************************************************!*\
  !*** ./src/modules/animation-builder/lib/utils.js ***!
  \****************************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cn: function() { return /* binding */ cn; },
/* harmony export */   copyTitle: function() { return /* binding */ copyTitle; },
/* harmony export */   deepSmartMerge: function() { return /* binding */ deepSmartMerge; },
/* harmony export */   getResponsiveAndBelow: function() { return /* binding */ getResponsiveAndBelow; },
/* harmony export */   isElementCustomized: function() { return /* binding */ isElementCustomized; },
/* harmony export */   mergeArrayObjects: function() { return /* binding */ mergeArrayObjects; },
/* harmony export */   removeFromDynamicCopy: function() { return /* binding */ removeFromDynamicCopy; },
/* harmony export */   validateInput: function() { return /* binding */ validateInput; },
/* harmony export */   validateStringFormat: function() { return /* binding */ validateStringFormat; }
/* harmony export */ });
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! clsx */ "./node_modules/clsx/dist/clsx.mjs");
/* harmony import */ var tailwind_merge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! tailwind-merge */ "./node_modules/tailwind-merge/dist/bundle-mjs.mjs");


function cn(...inputs) {
  return (0,tailwind_merge__WEBPACK_IMPORTED_MODULE_1__.twMerge)((0,clsx__WEBPACK_IMPORTED_MODULE_0__.clsx)(inputs));
}
const removeFromDynamicCopy = str => {
  const regex = /\s*copy(_\d+)?$/i;
  return str.replace(regex, "").trim();
};
const copyTitle = (mainTitle, sameTitle) => {
  if (sameTitle.length > 1) {
    return `${mainTitle} copy_${sameTitle.length}`;
  } else {
    return mainTitle + " copy";
  }
};
const validateInput = (value, regex) => {
  if (value === "") {
    return false;
  } else if (regex.test(value)) {
    return false;
  } else {
    return true;
  }
};
const validateStringFormat = input => {
  const pattern = /^(\w+:\s*[\w\d\-]+)(,\s*\w+:\s*[\w\d\-]+)*$/;
  return pattern.test(input);
};
const getResponsiveAndBelow = configKey => {
  const startIndex = WCF_ANIMATION_BUILDER?.device_config.findIndex(item => item.key === configKey);
  if (startIndex === -1) return [];
  return WCF_ANIMATION_BUILDER?.device_config.slice(startIndex).map(item => item.key);
};
function deepSmartMerge(source, target, base = {}) {
  if (typeof source !== "object" || source === null) return source;
  if (typeof target !== "object" || target === null) return structuredClone(source);
  const merged = Array.isArray(source) ? structuredClone(source) : {
    ...structuredClone(source)
  };
  for (const key in source) {
    const srcVal = source[key];
    const tgtVal = target[key];
    const baseVal = base[key];
    if (Array.isArray(srcVal)) {
      merged[key] = mergeArrayObjects(srcVal, tgtVal !== null && tgtVal !== void 0 ? tgtVal : [], baseVal !== null && baseVal !== void 0 ? baseVal : []);
    } else if (typeof srcVal === "object" && srcVal !== null) {
      merged[key] = deepSmartMerge(srcVal, tgtVal || {}, baseVal || {});
    } else {
      const wasCustomized = JSON.stringify(tgtVal) !== JSON.stringify(baseVal);
      merged[key] = wasCustomized ? structuredClone(tgtVal) : structuredClone(srcVal);
    }
  }
  for (const key in target) {
    if (!(key in source)) {
      const tgtVal = target[key];
      const baseVal = base[key];
      const wasCustomized = JSON.stringify(tgtVal) !== JSON.stringify(baseVal);
      if (wasCustomized) {
        merged[key] = structuredClone(tgtVal);
      }
    }
  }
  return merged;
}
const mergeArrayObjects = (sourceArr, targetArr = [], baseArr = []) => {
  const result = [];
  sourceArr.forEach(srcItem => {
    const targetMatch = targetArr.find(tgtItem => tgtItem.id === srcItem.id);
    const baseMatch = baseArr.find(baseItem => baseItem.id === srcItem.id);
    if (targetMatch) {
      result.push(deepSmartMerge(srcItem, targetMatch, baseMatch));
    } else {
      result.push(structuredClone(srcItem));
    }
  });
  targetArr.forEach(tgtItem => {
    const exists = result.find(item => item.id === tgtItem.id);
    if (!exists) result.push(structuredClone(tgtItem)); // FIXED: Clone to prevent reference
  });
  return result;
};
const isElementCustomized = (targetEl, sourceEl, device, deviceOrder, allAnimation) => {
  const currentIndex = deviceOrder.indexOf(device);
  if (currentIndex <= 0) return false;
  const parentDevice = deviceOrder[currentIndex - 1];
  const parentList = allAnimation[parentDevice] || [];
  const parentElement = parentList.find(el => el.id === targetEl.id);
  if (!parentElement) {
    return !deepEqual(targetEl, sourceEl);
  }
  return hasSignificantDifferences(targetEl, parentElement);
};
const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  if (typeof obj1 !== typeof obj2) return false;
  if (typeof obj1 !== "object") return obj1 === obj2;
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  return keys1.every(key => keys2.includes(key) && deepEqual(obj1[key], obj2[key]));
};
const hasSignificantDifferences = (obj1, obj2) => {
  const significantKeys = new Set();
  const collectSignificantDifferences = (a, b, path = "") => {
    if (typeof a !== typeof b) {
      significantKeys.add(path);
      return;
    }
    if (typeof a === "object" && a !== null && b !== null) {
      const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
      for (const key of allKeys) {
        if (key === "id" || key === "title" || key === "type") continue;
        const currentPath = path ? `${path}.${key}` : key;
        if (!(key in a) || !(key in b)) {
          const value = a[key] || b[key];
          if (isSignificantValue(value)) {
            significantKeys.add(currentPath);
          }
        } else if (!deepEqual(a[key], b[key])) {
          collectSignificantDifferences(a[key], b[key], currentPath);
        }
      }
    } else if (a !== b) {
      if (isSignificantValue(a) || isSignificantValue(b)) {
        significantKeys.add(path);
      }
    }
  };
  collectSignificantDifferences(obj1, obj2);
  return significantKeys.size > 0;
};
const isSignificantValue = value => {
  if (value === null || value === undefined) return false;
  if (typeof value === "number" && value !== 0) return true;
  if (typeof value === "string" && value.trim() !== "") return true;
  if (typeof value === "boolean") return true;
  if (Array.isArray(value) && value.length > 0) return true;
  if (typeof value === "object" && Object.keys(value).length > 0) return true;
  return false;
};

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ (function(module) {

module.exports = window["React"];

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ (function(module) {

module.exports = window["ReactDOM"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	!function() {
/******/ 		var getProto = Object.getPrototypeOf ? function(obj) { return Object.getPrototypeOf(obj); } : function(obj) { return obj.__proto__; };
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach(function(key) { def[key] = function() { return value[key]; }; });
/******/ 			}
/******/ 			def['default'] = function() { return value; };
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
!function() {
/*!**************************************************!*\
  !*** ./src/modules/animation-builder/preview.js ***!
  \**************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _frontend_animationUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./frontend/animationUtils */ "./src/modules/animation-builder/frontend/animationUtils.js");
/* harmony import */ var _components_common_AnimationStructure__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/common/AnimationStructure */ "./src/modules/animation-builder/components/common/AnimationStructure.jsx");
/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./index.css */ "./src/modules/animation-builder/index.css");


// import { animStructure } from "./lib/animStructure";


const storeState = {
  hoverEnabled: false
};
let storeAnimation = {};
function enableHover() {
  if (!storeState.hoverEnabled) {
    document.body.addEventListener("mouseover", _frontend_animationUtils__WEBPACK_IMPORTED_MODULE_1__.handleMouseOver);
    storeState.hoverEnabled = true;
  }
}
function disableHover() {
  if (storeState.hoverEnabled) {
    document.body.removeEventListener("mouseover", _frontend_animationUtils__WEBPACK_IMPORTED_MODULE_1__.handleMouseOver);
    storeState.hoverEnabled = false;
  }
}
function receivePageConfig() {
  window.addEventListener("message", event => {
    if ("wcf-animation-config" in event.data) {
      disableHover();
      storeAnimation = {};
      let mm;
      if (window.gsap) {
        mm?.revert?.();
        mm = gsap.matchMedia();
        wcf_anim_preview_object?.device_config?.map(device => {
          mm.add(device.mediaQuery, () => {
            event.data["wcf-animation-config"]?.[device?.key].forEach(section => {
              if (section.enable) {
                if (section.type === "preset") {
                  storeAnimation[section?.preset] = [...(storeAnimation[section?.preset] || []), section];
                } else {
                  storeAnimation["custom"] = [...(storeAnimation["custom"] || []), section];
                }
              }
            });
          });
        });
      }
      const cEvent = new CustomEvent("aae-animation-event", {
        detail: storeAnimation,
        // payload
        bubbles: true,
        // can bubble up the DOM
        cancelable: true // can be prevented
      });
      document.dispatchEvent(cEvent);
    }
    if ("wcf-animation-config-reset" in event.data) {
      const cEvent = new CustomEvent("aae-reset-animation", {
        detail: "",
        // payload
        bubbles: true,
        // can bubble up the DOM
        cancelable: true // can be prevented
      });
      document.dispatchEvent(cEvent);
    }
  }, false);
  setTimeout(() => {
    window.parent.postMessage(wcf_anim_preview_object);
  }, 1000);
}
function runPopup() {
  const closeBtn = document.querySelector(".wcfanimb-close-btn");
  const selectorContent = document.getElementById("wcfanim-popupContent");
  closeBtn.addEventListener("click", () => {
    (0,_frontend_animationUtils__WEBPACK_IMPORTED_MODULE_1__.hidePopup)();
    disableHover();
  });
  document.getElementById("wcfanim-expendSelector").addEventListener("click", e => {
    selectorContent.classList.toggle("close");
    if (selectorContent.classList.contains("close")) {
      document.getElementById("wcfanim-expendSelector").textContent = "Expand";
    } else {
      document.getElementById("wcfanim-expendSelector").textContent = "Shrink";
    }
  });
  document.body.addEventListener("click", event => {
    event.preventDefault();
    const target = event.target;
    if (target.closest(".wcfanimb-skip-selector-full")) {
      return;
    }
    const selector = (0,_frontend_animationUtils__WEBPACK_IMPORTED_MODULE_1__.getFullSelector)(target);
    // Show the popup at the click location
    enableHover();
    const isSkip = target.classList.contains("wcfanimb-skip-selector");
    if (!isSkip) {
      (0,_frontend_animationUtils__WEBPACK_IMPORTED_MODULE_1__.showPopup)(selector, event.clientX + 10, event.clientY + 10);
    }
  });
  document.getElementById("wcfanim-copySelector").addEventListener("click", () => {
    const textElement = document.getElementById("wcfanim-popupContent");
    const textToCopy = textElement.textContent;

    // Use navigator.clipboard if available
    if (navigator.clipboard && window.isSecureContext) {
      // Modern API for copying
      navigator.clipboard.writeText(textToCopy).then(() => {
        disableHover();
        (0,_frontend_animationUtils__WEBPACK_IMPORTED_MODULE_1__.hidePopup)();
      }).catch(err => {
        console.error("Failed to copy text: ", err);
      });
    } else {
      // Fallback to manual method for older browsers
      const tempTextarea = document.createElement("textarea");
      tempTextarea.value = textToCopy;

      // Style the textarea to be offscreen
      tempTextarea.style.position = "fixed";
      tempTextarea.style.top = "-9999px";
      document.body.appendChild(tempTextarea);

      // Select the text inside the textarea
      tempTextarea.focus();
      tempTextarea.select();
      try {
        if (document.execCommand("copy")) {
          disableHover();
          (0,_frontend_animationUtils__WEBPACK_IMPORTED_MODULE_1__.hidePopup)();
        }
      } catch (err) {
        console.error("Error copying text: ", err);
      }

      // Clean up by removing the temporary textarea
      document.body.removeChild(tempTextarea);
    }
  });
}
enableHover();
runPopup();
receivePageConfig();
// animStructure()

window.addEventListener("load", () => {
  const structure_panel = document.getElementById("wcf-anim-builder-structure");
  if (structure_panel) {
    wp.element.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_common_AnimationStructure__WEBPACK_IMPORTED_MODULE_2__["default"], null), structure_panel);
  }
});
}();
/******/ })()
;
//# sourceMappingURL=preview.js.map