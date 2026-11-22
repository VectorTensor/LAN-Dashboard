import {NextRequest, NextResponse} from "next/server";
import {EventPayload, generalDownloadPayload, produceEvent} from "@/lib/kafka";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log(body);

        const payload:generalDownloadPayload   = {

            file_url: body.file_url,
            downloadType: body.downloadType,
            name: body.name,
            mediaType: body.name,
            thumbnail_url: body.thumbnail_url,
            additional_info: body.additional_info,

        }

        const ev_payload: EventPayload = {
            job_type: "general-download-event",
            event_source: "lan dashboard",
            initiated_by: "user",
            payload_id : `${body.name}-${body.downloadType}-${body.mediaType}`,
            payload: payload

        }
        await produceEvent(ev_payload);

    }
    catch (error) {
        console.error(error);
    }

    return NextResponse.json(
        { message: "Event sent to kakfa" },
        { status: 200}
    );
}