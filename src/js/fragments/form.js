const FORM_SELECTOR = ".js-form";
const FORM_RESPONSE_SELECTOR = ".js-form__response";
const FORM_LABEL_SELECTOR = ".js-form__label";
const FORM_LABEL_ERROR_SELECTOR = ".js-form__label-error";

const HAS_VALUE_CLASS = "has-value";
const HAS_ERROR_CLASS = "has-error";

const errorsObj = {
    email: "Enter a valid value",
    common: "Enter a valid value",
    form: "Error",
};

export const initForm = () => {
    const formList = document.querySelectorAll(FORM_SELECTOR);
    formList.forEach((el) => new CustomForm(el));
};

class CustomForm {
    constructor(form) {
        this.form = form;
        this.inputsList = this.form.querySelectorAll("input, textarea");
        this.responseEl = this.form.querySelector(FORM_RESPONSE_SELECTOR);
        this.init();
    }

    init = () => {
        this.initValidation();
    };
  
    initValidation = () => {
        this.inputsList.forEach((input) => {
            input.addEventListener("input", () => {
                this.validInput(input);
            });
        });

        this.form.addEventListener("submit", (e) => {
            const isValid = this.validForm();

            if (!isValid) {
                e.preventDefault();
            }
        });
    };

    validForm = () => {
        let isValid = true;

        this.inputsList.forEach((input) => {
            let inputWrap = input.closest(FORM_LABEL_SELECTOR);
            if (!this.validInput(input)) {
                isValid = false;
                this.updateFormMsg(inputWrap, errorsObj.common, true);
            } else {
                this.updateFormMsg(inputWrap, "", false);
            }
        });

        return isValid;
    };

    validInput = (input, addError = true) => {
        this.checkIfHasValue(input);

        if (input.hasAttribute("data-required") && !this.validateRequired(input)) {
            if (addError) this.addInputError(input, errorsObj.common);
            return false;
        }
        if (input.hasAttribute("data-email") && !this.validateEmail(input)) {
            if (addError) this.addInputError(input, errorsObj.email);
            return false;
        }

        this.removeInputError(input);
        return true;
    };

    checkIfHasValue = (input) => {
        let inputWrap = input.closest(FORM_LABEL_SELECTOR);
        if (!inputWrap) return;

        !!input.value
            ? inputWrap.classList.add(HAS_VALUE_CLASS)
            : inputWrap.classList.remove(HAS_VALUE_CLASS);
    };

    updateFormMsg = (wrap, msg, isError = false) => {
        let errorEl = wrap?.querySelector(FORM_LABEL_ERROR_SELECTOR);

        if (!errorEl) return;
        errorEl.textContent = msg;
        isError ? errorEl.classList.add(HAS_ERROR_CLASS) : errorEl.classList.remove(HAS_ERROR_CLASS);
    };

    addInputError = (input, errorText = errorsObj.common) => {
        let inputWrap = input.closest(FORM_LABEL_SELECTOR);
        this.updateFormMsg(inputWrap, errorText, true);
        inputWrap?.classList.add(HAS_ERROR_CLASS);
    };

    removeInputError = (input) => {
        let inputWrap = input.closest(FORM_LABEL_SELECTOR);
        this.updateFormMsg(inputWrap, "", false);
        inputWrap?.classList.remove(HAS_ERROR_CLASS);
    };

    validateRequired = (input) => {
        return input.type === "checkbox" || input.type === "radio" ? input.checked : !!input.value;
    };

    validateEmail = (input) => {
        if (!input.value) return true;
        let re =
            /^(([^<>а-яА-Я()[\]\\.,;:\s@"]+(\.[^<>()а-яА-Я[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$|^(([^<>a-zA-Z()[\]\\.,;:\s@"]+(\.[^<>()a-zA-Z[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([а-яА-Я\-0-9]+\.)+[а-яА-Я]{2,}))$/;
        return re.test(String(input.value).toLowerCase());
    };
}

initForm();
