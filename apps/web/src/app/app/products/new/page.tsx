import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@launchmint/ui";
import { NewProductForm } from "./new-product-form";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Add a product</CardTitle>
          <CardDescription>
            Paste your URL and we'll prefill the basics. You can edit anything
            after.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
