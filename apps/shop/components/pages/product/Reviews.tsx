import { Card, CardContent } from "@eugenios/ui/components/card";
import { Typography } from "@eugenios/ui/src/components/ui/Typography";
import { Star } from "lucide-react";

/**
 * Displays a section with customer reviews, including a heading and three identical testimonial cards.
 *
 * Each card features a five-star rating, a fixed testimonial text, and reviewer details.
 * The layout is responsive, showing one column on small screens and three columns on medium and larger screens.
 */
export default function Reviews() {
  return (
    <>
      <div className="text-center mb-10">
        <Typography as="h2" variant="subtitle" className="uppercase font-bold tracking-tight">
          O Que Os Nossos Clientes Dizem
        </Typography>
        <div className="mt-1 mx-auto w-8 h-0.5 bg-primary/80"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border">
            <CardContent className="pt-6">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Uma experiência incrível! As massagens são excelentes e os terapeutas são muito profissionais.
                Recomendo a todos que buscam relaxamento e bem-estar."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                <div>
                  <p className="font-medium text-sm">Maria S.</p>
                  <p className="text-xs text-muted-foreground">Cliente desde 2022</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
