import { Fragment, useRef, useState } from "react";
import clsx from "clsx";
import AccountIcon from "remixicon-react/AccountCircleLineIcon";
import { Form, Link } from "@remix-run/react";

import { appearanceBtnClsx, dropDownSlot } from "./styled";
import { Box, Container } from "../utilities/layout";
import { Dropdown } from "../utilities/dropdown";
import { useClientsTabContext } from "~/context/clientsTab";

const accountOptions = [
  { label: "Setting", pathname: "setting" },
  { label: "Log Out", pathname: "logout" },
];

export const Account = () => {
  const [isOpened, setIsOpened] = useState(false);

  const isLogoutOption = useRef(false);

  const { isController } = useClientsTabContext();

  return (
    <Container
      newClasses={clsx(appearanceBtnClsx, isOpened && "z-50")}
      onClick={() =>
        isLogoutOption.current
          ? setIsOpened(true)
          : setIsOpened((prev) => !prev)
      }
    >
      <AccountIcon size="24" />

      <Dropdown isOpened={isOpened} setIsOpened={setIsOpened}>
        {accountOptions.map((option) => (
          <Fragment key={option.label}>
            {option.pathname === "logout" ? (
              <Box
                newClasses={clsx(dropDownSlot, "whitespace-nowrap")}
                onClick={() => {
                  isLogoutOption.current = true;
                }}
              >
                <Form action="/logout" method="post" replace>
                  <input
                    type="hidden"
                    name="isController"
                    defaultValue={
                      isController ? isController.toString() : undefined
                    }
                  />
                  <button type="submit" className="button">
                    {option.label}
                  </button>
                </Form>
              </Box>
            ) : (
              <Link to={option.pathname}>
                <Box
                  newClasses={dropDownSlot}
                  onClick={() => {
                    isLogoutOption.current = false;
                  }}
                >
                  {option.label}
                </Box>
              </Link>
            )}
          </Fragment>
        ))}
      </Dropdown>
    </Container>
  );
};
