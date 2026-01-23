import React from "react";
import { MapPin, Star, ExternalLink, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StoreLocator: React.FC = () => {
    const googleReviewUrl = "https://www.google.com/search?q=kyna+jewels&oq=kyna+jewels+&gs_lcrp=EgZjaHJvbWUqBggAEEUYOzIGCAAQRRg7MgYIARBFGDwyBggCEEUYPNIBCTEzMjA2ajBqN6gCALACAA&sourceid=chrome&ie=UTF-8#lrd=0x3be7c9a878b8a537:0x5b59e9340aeed594,1,,,,";

    return (
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-[#F9FBFB]">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-[#1A141F] mb-4">Visit Kyna Jewellery</h2>
                        <div className="w-24 h-1 bg-[#328F94] mx-auto rounded-full mb-6"></div>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light">
                            Experience our exquisite collection in person at our flagship boutique in Mumbai.
                        </p>
                    </motion.div>
                </div>

                <div className="grid gap-8">
                    {/* Google Review Shortcut Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <a
                            href={googleReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                        >
                            <Card className="overflow-hidden border-none bg-gradient-to-r from-[#328F94] to-[#45b7bc] text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                                            <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">What Our Clients Adore</h3>
                                            <p className="text-white/80">Discover the magic through our community's eyes</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center md:items-end gap-2">
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star key={i} className="w-5 h-5 fill-white text-white" />
                                            ))}
                                        </div>
                                        <Button variant="secondary" className="rounded-full px-8 bg-white text-[#328F94] hover:bg-gray-100 font-bold border-none group-hover:scale-105 transition-transform">
                                            See our Google Reviews <ExternalLink className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </a>
                    </motion.div>

                    {/* Map and Address Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <Card className="overflow-hidden shadow-2xl border-none bg-white rounded-3xl">
                            <div className="aspect-[21/10] w-full min-h-[400px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6530.894204506532!2d72.840038223658!3d19.082873741659498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9a878b8a537%3A0x5b59e9340aeed594!2sKyna%20Jewellery!5e0!3m2!1sen!2sin!4v1769165106726!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen={true}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Kyna Jewellery Store Location"
                                    className="grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                                ></iframe>
                            </div>
                            <CardContent className="p-10 bg-white">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#328F94]/10 p-3 rounded-2xl text-[#328F94]">
                                            <MapPin className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold tracking-[0.2em] text-[#328F94] uppercase mb-2">Flagship Store</h4>
                                            <p className="text-xl md:text-2xl font-semibold text-[#1A141F] leading-snug">
                                                Navneet Building, 5, <br className="hidden sm:block" />
                                                Santacruz (West), Mumbai, <br className="hidden sm:block" />
                                                Maharashtra 400055
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        className="bg-[#1A141F] hover:bg-black text-white rounded-full px-10 py-6 text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        <a
                                            href="https://www.google.com/maps/dir/?api=1&destination=Kyna+Jewellery+Navneet+Building+Santacruz+West+Mumbai+400055"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Navigation className="mr-2 w-5 h-5" /> Get Directions
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default StoreLocator;
