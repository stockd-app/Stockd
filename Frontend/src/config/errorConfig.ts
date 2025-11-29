import error400 from "../assets/images/error_handling/food_splash_art.png";
import error401 from "../assets/images/error_handling/food_splash_art.png";
import error500 from "../assets/images/error_handling/falling_splash_art.png";
import error503 from "../assets/images/error_handling/falling_splash_art.png";

export const UNKNOWN_ERROR = "Unknown error";

export const ERROR_CONFIG: Record<
    string,
    {
        code: string;
        title: string;
        message: string;
        subtext?: string;
        image: string;
        buttonText: string;
    }
> = {
    "400": {
        code: "400",
        title: "Request Error",
        message:
            "We couldn’t complete your Google sign-in because your request was incomplete or invalid.",
        subtext: "Please check your Google account or try again.",
        image: error400,
        buttonText: "Retry Sign In",
    },
    "401": {
        code: "401",
        title: "Authentication Failed",
        message:
            "We couldn’t verify your Google identity. Your sign-in session may have expired.",
        image: error401,
        buttonText: "Retry Sign In",
    },
    "500": {
        code: "500",
        title: "Internal Error",
        message:
            "Something went wrong on our side while processing your Google sign-in.",
        subtext: "Please try again later.",
        image: error500,
        buttonText: "Try again later",
    },
    "503": {
        code: "503",
        title: "Unable to Process Request",
        message:
            "We’re unable to handle your Google sign-in request at the moment.",
        subtext: "This may be caused by a timeout or temporary outage.",
        image: error503,
        buttonText: "Try again later",
    },
};
