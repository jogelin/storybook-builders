import { storiesOf } from "@storybook/angular";
import { MySharedLibraryComponent } from "./my-shared-library.component";

storiesOf("Share Library Component", module).add(
  "Component with separate template",
  () => ({
    component: MySharedLibraryComponent,
    props: {}
  })
);
